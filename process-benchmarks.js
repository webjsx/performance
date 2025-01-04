import { spawn } from "child_process";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";
import open from "open";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "inherit"],
    });
    let output = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

async function runBrowserBenchmarks(framework, duration, testFilter) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const results = [];
  const seenTests = new Set();

  // Set up console log forwarding
  page.on("console", (msg) => {
    const text = msg.text();
    if (!text.includes("Failed to load resource") && !text.includes("404")) {
      console.log(`[${framework}]`, text);
    }
  });

  try {
    // Navigate to the appropriate URL based on framework
    const url =
      framework === "react" ? "http://localhost:4173" : "http://localhost:4174";
    await page.goto(url);

    // Set duration in the page
    await page.$eval(
      "#duration",
      (el, dur) => {
        el.value = dur.toString();
      },
      duration
    );

    // Inject test filter
    if (testFilter) {
      await page.evaluate((filter) => {
        window.testFilter = filter;
      }, testFilter);
    }

    // Click the run tests button
    await page.click("#run-tests");

    // Poll for results periodically
    while (true) {
      const newResults = await page.evaluate(() => {
        return window.benchmarkResults?.allResults || [];
      });

      // Process any new results
      for (const result of newResults) {
        // Only process if we haven't seen this test before
        if (!seenTests.has(result.name)) {
          seenTests.add(result.name);

          if (!testFilter || result.name.includes(testFilter)) {
            results.push(result);
            // Format numbers with null checks
            const hz = result.hz ? result.hz.toFixed(2) : "N/A";
            const mean = result.stats?.mean
              ? result.stats.mean.toFixed(3)
              : "N/A";
            const deviation = result.stats?.deviation
              ? result.stats.deviation.toFixed(2)
              : "N/A";

            console.log(
              `[${framework}] ${result.name}: ${hz} ops/sec, ${mean}ms ±${deviation}%`
            );
          }
        }
      }

      // Check if tests are complete
      const isComplete = await page.evaluate(() => {
        const button = document.getElementById("run-tests");
        return button && !button.disabled;
      });

      if (isComplete && newResults.length > 0) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } finally {
    await browser.close();
  }

  return results;
}

function generateHtml(reactResults, webjsxResults) {
  const allTestNames = new Set([
    ...reactResults.map((r) => r.name),
    ...webjsxResults.map((w) => w.name),
  ]);

  const rows = Array.from(allTestNames).map((testName) => {
    const react = reactResults.find((r) => r.name === testName) || {};
    const webjsx = webjsxResults.find((w) => w.name === testName) || {};

    const comparison =
      react.hz && webjsx.hz ? (webjsx.hz / react.hz - 1) * 100 : null;

    return {
      testName,
      reactOps: react.hz?.toFixed(2) || "-",
      reactTime: react.stats?.mean?.toFixed(3) || "-",
      webjsxOps: webjsx.hz?.toFixed(2) || "-",
      webjsxTime: webjsx.stats?.mean?.toFixed(3) || "-",
      comparison: comparison !== null ? comparison.toFixed(1) : "-",
    };
  });

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Framework Comparison Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        tr:hover {
            background: #f8f8f8;
        }
        .positive {
            color: #22c55e;
        }
        .negative {
            color: #ef4444;
        }
        .time {
            color: #666;
            font-size: 0.9em;
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Framework Performance Comparison</h1>
        <p>React vs WebJSX Performance Benchmark Results</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Test</th>
                <th>React (ops/sec)</th>
                <th>React (ms)</th>
                <th>WebJSX (ops/sec)</th>
                <th>WebJSX (ms)</th>
                <th>Difference</th>
            </tr>
        </thead>
        <tbody>
            ${rows
              .map(
                (row) => `
                <tr>
                    <td>${row.testName}</td>
                    <td>${row.reactOps}</td>
                    <td class="time">${row.reactTime}</td>
                    <td>${row.webjsxOps}</td>
                    <td class="time">${row.webjsxTime}</td>
                    <td class="${
                      parseFloat(row.comparison) > 0 ? "positive" : "negative"
                    }">
                        ${row.comparison === "-" ? "-" : row.comparison + "%"}
                    </td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
    <p><small>Generated on ${new Date().toLocaleString()}</small></p>
    <script>
        // Add sorting functionality
        document.querySelectorAll('th').forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const table = header.closest('table');
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    const aValue = a.children[index].textContent;
                    const bValue = b.children[index].textContent;
                    
                    if (index === 0) {
                        return aValue.localeCompare(bValue);
                    }
                    
                    const aNum = parseFloat(aValue);
                    const bNum = parseFloat(bValue);
                    
                    if (isNaN(aNum) || isNaN(bNum)) return 0;
                    return bNum - aNum;
                });
                
                tbody.innerHTML = '';
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    </script>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outputArg = args.findIndex((arg) => arg === "--out");
  const outputPath =
    outputArg !== -1
      ? args[outputArg + 1]
      : join(os.tmpdir(), `benchmark-${Date.now()}.html`);

  // Fix: Change how we parse framework argument to handle both formats
  const frameworkArg = args.find(
    (arg) =>
      arg.startsWith("--framework=") || arg === "-f" || arg === "--framework"
  );
  const framework = frameworkArg
    ? frameworkArg.includes("=")
      ? frameworkArg.split("=")[1]
      : args[args.indexOf(frameworkArg) + 1]
    : undefined;

  // Fix: Change how we parse test argument to handle both formats
  const testArg = args.find(
    (arg) => arg.startsWith("--test=") || arg === "-t" || arg === "--test"
  );
  const testFilter = testArg
    ? testArg.includes("=")
      ? testArg.split("=")[1]
      : args[args.indexOf(testArg) + 1]
    : undefined;

  const durationArg = args.find((arg) => arg.startsWith("--duration="));
  const duration = durationArg ? parseFloat(durationArg.split("=")[1]) : 3;

  console.log(`Running benchmarks with duration: ${duration}s`);
  console.log(`Selected framework: ${framework || "all"}`);
  if (testFilter) {
    console.log(`Test filter: ${testFilter}`);
  }

  let reactResults = [];
  let webjsxResults = [];

  // Only run React if specifically requested or if no framework specified
  if (!framework || framework === "react") {
    console.log("Running React benchmarks...");
    reactResults = await runBrowserBenchmarks("react", duration, testFilter);
  }

  // Only run WebJSX if specifically requested or if no framework specified
  if (!framework || framework === "webjsx") {
    console.log("\nRunning WebJSX benchmarks...");
    webjsxResults = await runBrowserBenchmarks("webjsx", duration, testFilter);
  }

  const html = generateHtml(reactResults, webjsxResults);
  await fs.writeFile(outputPath, html);

  if (!args.includes("--out")) {
    console.log("Opening results in browser...");
    await open(outputPath);
  } else {
    console.log(`Results written to ${outputPath}`);
  }
}

main().catch(console.error);
