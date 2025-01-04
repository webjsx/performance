import {
  TestSuite,
  TestSuiteOptions,
  TestCase,
  BenchmarkResult,
} from "./types.js";
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

  runTest(testCase: TestCase, options: TestSuiteOptions): BenchmarkResult {
    options.onTestStart?.(testCase.name);
    this.cleanup();
    return runBenchmark(testCase.name, testCase.run, options);
  }

  abstract getAllTests(): AsyncGenerator<TestCase, void, unknown>;
}
