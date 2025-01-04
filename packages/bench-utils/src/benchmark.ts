import { TestSuiteOptions, BenchmarkResult } from "./types.js";

export function runBenchmark(
  name: string,
  fn: () => void,
  options: TestSuiteOptions
): BenchmarkResult {
  const duration = (options.duration ?? 2) * 1000;
  const startTime = performance.now();
  const endTime = startTime + duration;
  let iterations = 0;

  while (performance.now() < endTime) {
    fn();
    iterations++;
  }

  const actualDuration = performance.now() - startTime;
  const hz = iterations / (actualDuration / 1000);
  const meanTime = actualDuration / iterations;

  const sampleSize = Math.min(50, Math.max(5, Math.floor(iterations * 0.1)));
  const samples: number[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }

  const mean = samples.reduce((a, b) => a + b) / samples.length;
  const squaredDiffs = samples.map((x) => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / samples.length;
  const deviation = (Math.sqrt(variance) / mean) * 100;

  return {
    name,
    hz,
    stats: {
      mean: meanTime,
      deviation,
    },
  };
}
