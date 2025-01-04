import type { BenchmarkResult, TestSuite, TestCase } from "./types.js";

export const benchmarkStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
  }

  .container {
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 40px);
  }

  .left-pane {
    flex: 1;
    max-width: 500px;
  }

  .right-pane {
    flex: 1;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  #controls {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }

  .control-group {
    margin-bottom: 15px;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  .control-row {
    margin-bottom: 8px;
  }

  .control-row:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 5px;
    color: #374151;
  }

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 10px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover {
    background: #1d4ed8;
  }

  button:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }

  #results {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  #results pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #374151;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .initial-message {
    color: #6b7280;
    text-align: center;
    padding: 40px;
    font-size: 18px;
  }

  .running-message {
    color: #2563eb;
    text-align: center;
    padding: 40px;
    font-size: 18px;
    line-height: 1.6;
  }

  .completed-message {
    color: #059669;
    text-align: center;
    padding: 40px;
    font-size: 24px;
  }
`;

export function setupBenchmarkUI() {
  const resultsContainer = document.querySelector("#results pre");
  const runButton = document.getElementById("run-tests") as HTMLButtonElement;
  const appContainer = document.getElementById("app");

  // Store for raw benchmark results
  window.benchmarkResults = {
    allResults: [],
    latestResults: null,
  };

  function appendResult(result: BenchmarkResult, elapsed: number) {
    const resultText = `Test: ${result.name}
- Operations/sec: ${result.hz.toFixed(2)}
- Average time: ${(1000 / result.hz).toFixed(3)}ms
- Test duration: ${elapsed.toFixed(2)}s
- Deviation: ±${result.stats.deviation.toFixed(2)}%

`;
    if (resultsContainer!.textContent === "No results to show") {
      resultsContainer!.textContent = resultText;
    } else {
      resultsContainer!.textContent += resultText;
    }
    resultsContainer!.scrollTop = resultsContainer!.scrollHeight;

    // Store the result
    window.benchmarkResults.allResults.push(result);
    window.benchmarkResults.latestResults = result;
  }

  function updateCurrentTest(name: string) {
    appContainer!.innerHTML = `
      <div class="running-message">
        Running test:<br>
        ${name}
      </div>
    `;
  }

  async function runAllTests(suites: TestSuite[]) {
    const duration =
      parseFloat(
        (document.getElementById("duration") as HTMLInputElement).value
      ) || 2;
    const startTime = performance.now();
    const testFilter = (window as any).testFilter;

    try {
      window.benchmarkResults.allResults = [];
      resultsContainer!.textContent = "No results to show";

      for (const suite of suites) {
        console.log("Running suite:", suite.name);

        for await (const testCase of suite.getAllTests()) {
          // Skip tests that don't match the filter
          if (testFilter && !testCase.name.includes(testFilter)) {
            continue;
          }

          const result = suite.runTest(testCase, {
            duration,
            onTestStart: (testName: string) => {
              updateCurrentTest(testName);
            },
          });
          const elapsed = (performance.now() - startTime) / 1000;
          appendResult(result, elapsed);
          // Let the UI update
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      appContainer!.innerHTML = `<div class="completed-message">✓ Completed in ${totalTime}s</div>`;
    } catch (error) {
      console.error("Test error:", error);
      appContainer!.innerHTML = `
        <div style="color: #f44336; font-size: 24px;">
          ✗ Error occurred
        </div>
      `;
      resultsContainer!.textContent += `\nError: ${error}\n`;
    } finally {
      runButton!.textContent = "Run All Tests";
      runButton!.disabled = false;
    }
  }

  runButton!.addEventListener("click", () => {
    runButton!.disabled = true;
    runButton!.textContent = "Running...";
    runAllTests(window.testSuites);
  });
}
