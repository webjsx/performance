import { BenchmarkResult } from "../types.js";

const separator = "─".repeat(50);
const header = "📊 BENCHMARK RESULTS";

export function formatResults(results: BenchmarkResult[]): string {
  return `
${separator}
${header}
${separator}

${results
  .map((result) => {
    const opsPerSec = result.hz.toFixed(2);
    const meanMs = (1000 / result.hz).toFixed(3);
    const deviation = result.stats.deviation.toFixed(2);

    return `Test: ${result.name}
- Operations/sec: ${opsPerSec}
- Average time: ${meanMs}ms
- Deviation: ±${deviation}%
`;
  })
  .join("\n")}
${separator}`;
}

export function displayResults(results: BenchmarkResult[]): void {
  const resultDiv = document.getElementById("results");
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <pre style="
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      white-space: pre-wrap;
      margin: 20px 0;
    ">${formatResults(results)}</pre>
  `;
}

export function displayProgress(result: BenchmarkResult): void {
  const progressDiv = document.getElementById("progress");
  if (!progressDiv) return;

  const opsPerSec = result.hz.toFixed(2);
  const meanMs = (1000 / result.hz).toFixed(3);
  const deviation = result.stats.deviation.toFixed(2);

  progressDiv.innerHTML = `
    <pre style="
      background: #e9f5e9;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      margin: 10px 0;
    ">Last completed - Test: ${result.name} - Operations/sec: ${opsPerSec} - Average time: ${meanMs}ms - Deviation: ±${deviation}%</pre>
  `;
}
