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

  let currentTest = null;
  for (const line of lines) {
    if (line.includes("Test:")) {
      if (currentTest) {
        results.push(currentTest);
      }
      currentTest = {
        name: line.replace("Test:", "").trim(),
        opsPerSec: null,
        avgTime: null,
        deviation: null,
      };
    } else if (currentTest) {
      if (line.includes("Operations/sec:")) {
        currentTest.opsPerSec = parseFloat(line.split(":")[1]);
      } else if (line.includes("Average time:")) {
        currentTest.avgTime = parseFloat(line.split(":")[1]);
      } else if (line.includes("Deviation:")) {
        currentTest.deviation = parseFloat(line.split(":")[1]);
      }
    }
  }
  if (currentTest) {
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

    return {
      testName,
      reactOps: react.opsPerSec?.toFixed(2) || "-",
      reactTime: react.avgTime?.toFixed(3) || "-",
      webjsxOps: webjsx.opsPerSec?.toFixed(2) || "-",
      webjsxTime: webjsx.avgTime?.toFixed(3) || "-",
      comparison:
        react.opsPerSec && webjsx.opsPerSec
          ? ((webjsx.opsPerSec / react.opsPerSec - 1) * 100).toFixed(1)
          : "-",
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
    </style>
</head>
<body>
    <h1>Framework Performance Comparison</h1>
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
</body>
</html>`;
}

async function main() {
  const outputPath =
    process.argv[2] || join(os.tmpdir(), `benchmark-${Date.now()}.html`);

  console.log("Running React benchmarks...");
  const reactOutput = await runCommand("npm", ["run", "react-tests"]);
  const reactResults = parseResults(reactOutput);

  console.log("Running WebJSX benchmarks...");
  const webjsxOutput = await runCommand("npm", ["run", "webjsx-tests"]);
  const webjsxResults = parseResults(webjsxOutput);

  const html = generateHtml(reactResults, webjsxResults);
  await fs.writeFile(outputPath, html);

  if (!process.argv[2]) {
    console.log("Opening results in browser...");
    await open(outputPath);
  } else {
    console.log(`Results written to ${outputPath}`);
  }
}

main().catch(console.error);
