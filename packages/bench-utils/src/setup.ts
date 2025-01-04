import { BenchmarkResult } from "./types.js";

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
