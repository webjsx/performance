import { BenchmarkResult } from "../types.js";

export function formatResults(results: BenchmarkResult[]): string {
  return results
    .map((result) => {
      const opsPerSec = result.hz.toFixed(2);
      const meanMs = (1000 / result.hz).toFixed(3);
      const deviation = result.stats.deviation.toFixed(2);

      return `
${result.name}
  Ops/sec: ${opsPerSec}
  Mean (ms): ${meanMs}
  Deviation: ±${deviation}%
`;
    })
    .join("\n");
}

export function displayResults(results: BenchmarkResult[]): void {
  const resultDiv = document.getElementById("results");
  if (!resultDiv) return;

  resultDiv.innerHTML = `<pre>${formatResults(results)}</pre>`;
}
