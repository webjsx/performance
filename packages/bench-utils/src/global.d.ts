import type { BenchmarkResult, TestSuite } from "./types.js";

declare global {
  interface Window {
    benchmarkResults: {
      allResults: BenchmarkResult[];
      latestResults: BenchmarkResult | null;
    };
    testSuites: TestSuite[];
  }
}
