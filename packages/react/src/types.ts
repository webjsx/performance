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
  run(): Promise<BenchmarkResult[]>;
}