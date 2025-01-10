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
  private containerId: string;

  constructor(containerId: string = "app") {
    this.containerId = containerId;
    this.container = document.getElementById(containerId) as HTMLElement;
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
  }

  protected cleanup() {
    const oldContainer = this.container;
    const newContainer = document.createElement("div");
    newContainer.id = this.containerId;
    oldContainer.replaceWith(newContainer);
    this.container = newContainer;
  }

  runTest(
    testCase: TestCase,
    options: TestSuiteOptions,
  ): BenchmarkResult {
    this.cleanup();
    return runBenchmark(testCase.name, testCase.run, options);
  }

  abstract getAllTests(): AsyncGenerator<TestCase, void, unknown>;
}
