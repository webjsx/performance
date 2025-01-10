export interface BenchmarkResult {
  name: string;
  hz: number;
  stats: {
    mean: number;
    deviation: number;
  };
}

export interface TestCase {
  name: string;
  run: () => void;
}

export interface TestSuiteOptions {
  /**
   * Duration in seconds to run each test for
   * @default 2
   */
  duration?: number;
}

export interface TestSuite {
  name: string;
  /**
   * Gets all available test cases without running them
   */
  getAllTests(): AsyncGenerator<TestCase, void, unknown>;

  /**
   * Runs the specified test case and returns the benchmark result
   */
  runTest(
    testCase: TestCase,
    options: TestSuiteOptions,
  ): BenchmarkResult;
}

export interface BenchmarkOptions {
  /** Duration in seconds to run benchmarks for */
  duration?: number;
  /** Working directory for the benchmark process */
  cwd?: string;
  /** Filter to only run tests from specific framework */
  framework?: string;
  /** Filter to only run tests matching this name */
  test?: string;
}
