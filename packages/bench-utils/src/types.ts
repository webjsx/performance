export interface BenchmarkResult {
  name: string;
  hz: number;
  stats: {
    mean: number;
    deviation: number;
  };
}

export interface TestSuite {
  name: string;
  run(options: TestSuiteOptions): Promise<BenchmarkResult[]>;
}

export interface TestSuiteOptions {
  /**
   * Duration in seconds to run each test for
   * @default 2
   */
  duration?: number;
}

export interface BenchmarkOptions {
  /** Duration in seconds to run benchmarks for */
  duration?: number;
  /** Working directory for the benchmark process */
  cwd?: string;
}
