import type { BenchmarkResult, TestSuite } from "./types.js";

export const benchmarkStyles = `
  /* ... styles remain the same ... */
`;

export function setupBenchmarkUI() {
  const resultsContainer = document.querySelector("#results pre");
  const runButton = document.getElementById("run-tests");
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

    try {
      window.benchmarkResults.allResults = [];
      resultsContainer!.textContent = "No results to show";

      for (const suite of suites) {
        console.log("Running suite:", suite.name);
        const generator = suite.run({
          duration,
          onTestStart: (testName: string) => {
            updateCurrentTest(testName);
          },
        });

        for await (const result of generator) {
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
