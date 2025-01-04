import { spawn } from "child_process";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";
import open from "open";

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

function parseResults(output) {
  const results = [];
  const lines = output.split("\n");

  console.log("Raw output:", output); // Debug log

  let currentTest = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and separator lines
    if (!line || line.startsWith("─")) continue;

    // Try to match different possible formats of test output
    if (
      trimmedLine.includes("Test:") ||
      trimmedLine.match(/^[A-Za-z][A-Za-z0-9 -]+$/)
    ) {
      // If we have a current test, push it before starting a new one
      if (currentTest && currentTest.name && currentTest.opsPerSec !== null) {
        results.push(currentTest);
      }

      currentTest = {
        name: trimmedLine.replace("Test:", "").trim(),
        opsPerSec: null,
        avgTime: null,
        deviation: null,
      };
    } else if (currentTest) {
      // Parse operations per second (handle different formats)
      if (
        trimmedLine.includes("Operations/sec:") ||
        trimmedLine.includes("Ops/sec:")
      ) {
        const match = trimmedLine.match(/[\d.]+/);
        if (match) {
          currentTest.opsPerSec = parseFloat(match[0]);
        }
      }
      // Parse average time (handle different formats)
      else if (
        trimmedLine.includes("Average time:") ||
        trimmedLine.includes("Mean:") ||
        trimmedLine.includes("Mean (ms):")
      ) {
        const match = trimmedLine.match(/[\d.]+/);
        if (match) {
          currentTest.avgTime = parseFloat(match[0]);
        }
      }
      // Parse deviation (handle different formats)
      else if (
        trimmedLine.includes("Deviation:") ||
        trimmedLine.includes("±")
      ) {
        const match = trimmedLine.match(/[\d.]+/);
        if (match) {
          currentTest.deviation = parseFloat(match[0]);
        }
      }
    }
  }

  // Don't forget to push the last test
  if (currentTest && currentTest.name && currentTest.opsPerSec !== null) {
    results.push(currentTest);
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
      react.opsPerSec && webjsx.opsPerSec
        ? (webjsx.opsPerSec / react.opsPerSec - 1) * 100
        : null;

    return {
      testName,
      reactOps: react.opsPerSec?.toFixed(2) || "-",
      reactTime: react.avgTime?.toFixed(3) || "-",
      webjsxOps: webjsx.opsPerSec?.toFixed(2) || "-",
      webjsxTime: webjsx.avgTime?.toFixed(3) || "-",
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

  const durationArg =
    args.find((arg) => arg.startsWith("--duration="))?.split("=")[1] || "3";
  const duration = parseFloat(durationArg);

  console.log(`Running benchmarks with duration: ${duration}s`);

  console.log("Running React benchmarks...");
  const reactOutput = await runCommand("npm", [
    "run",
    "react-tests",
    `--duration=${duration}`,
  ]);
  console.log("\nParsing React results...");
  const reactResults = parseResults(reactOutput);
  console.log("\nReact Benchmark Results:");
  console.log("─".repeat(50));
  reactResults.forEach((result) => {
    console.log(`Test: ${result.name}`);
    console.log(`  Operations/sec: ${result.opsPerSec.toFixed(2)}`);
    console.log(`  Average time: ${result.avgTime.toFixed(3)}ms`);
    console.log(`  Deviation: ±${result.deviation.toFixed(2)}%`);
    console.log("─".repeat(50));
  });

  console.log("\nRunning WebJSX benchmarks...");
  const webjsxOutput = await runCommand("npm", [
    "run",
    "webjsx-tests",
    `--duration=${duration}`,
  ]);
  console.log("\nParsing WebJSX results...");
  const webjsxResults = parseResults(webjsxOutput);
  console.log("\nWebJSX Benchmark Results:");
  console.log("─".repeat(50));
  webjsxResults.forEach((result) => {
    console.log(`Test: ${result.name}`);
    console.log(`  Operations/sec: ${result.opsPerSec.toFixed(2)}`);
    console.log(`  Average time: ${result.avgTime.toFixed(3)}ms`);
    console.log(`  Deviation: ±${result.deviation.toFixed(2)}%`);
    console.log("─".repeat(50));
  });

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
