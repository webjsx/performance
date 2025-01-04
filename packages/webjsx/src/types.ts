export interface BenchmarkResult {
  name: string;
  hz: number;
  stats: {
    mean: number;
    deviation: number;
  };
}

export interface TestSuiteOptions {
  /**
   * Duration in seconds to run each test for
   * @default 2
   */
  duration?: number;
  onTestStart?: (testName: string) => void;
}

export interface TestSuite {
  name: string;
  run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown>;
}
