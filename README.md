# UI Framework Benchmarks

This repository contains benchmarks comparing different UI frameworks for browser performance.

## Setup

```bash
npm install
```

## Running Benchmarks

### React Benchmarks

```bash
cd packages/react
npm run build
npm run benchmark
```

### WebJSX Benchmarks

```bash
cd packages/webjsx
npm run build
npm run benchmark
```

## Benchmark Suite

Currently the following benchmarks are included:

### Initial Render Tests

- Single div render: Measures performance of rendering a simple div element
- Nested divs render: Measures performance of rendering deeply nested div elements

## Design

The benchmarks are designed to:

- Run in both browser and Node.js environments
- Measure performance using the browser's Performance API
- Run multiple iterations to get statistically significant results
- Clean up the DOM between test runs to avoid interference

Each test runs 1000 iterations and reports:

- Operations per second
- Mean time per operation in milliseconds
- Statistical deviation

## Adding New Tests

Test suites should implement the `TestSuite` interface:

```ts
interface TestSuite {
  name: string;
  run(): Promise<BenchmarkResult[]>;
}
```

See the existing test files in `packages/*/src/benchmarks/` for examples.
