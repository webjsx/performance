import { TestSuite, TestSuiteOptions, BenchmarkResult } from "./types.js";
import { runBenchmark } from "./benchmark.js";

export abstract class BaseTestSuite implements TestSuite {
  abstract name: string;
  protected container: HTMLElement;

  constructor(containerId: string = "app") {
    this.container = document.getElementById(containerId) as HTMLElement;
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
  }

  protected cleanup() {
    this.container.innerHTML = "";
  }

  protected runTest(
    name: string,
    fn: () => void,
    options: TestSuiteOptions
  ): BenchmarkResult {
    options.onTestStart?.(name);
    return runBenchmark(name, fn, options);
  }

  abstract run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown>;
}
