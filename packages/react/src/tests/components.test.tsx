import * as React from "react";
import * as ReactDOM from "react-dom/client";
import type { TestSuite, BenchmarkResult, TestSuiteOptions } from "../types.js";

const SimpleComponent = () => <div>Simple component</div>;

const ComplexComponent: React.FC<{ count: number }> = ({ count }) => (
  <div className="complex">
    <header>
      <h1>Complex Component</h1>
      <p>Count: {count}</p>
    </header>
    <main>
      {Array.from({ length: 5 }, (_, i) => (
        <section key={i}>
          <h2>Section {i + 1}</h2>
          <p>Content for section {i + 1}</p>
        </section>
      ))}
    </main>
    <footer>Footer content</footer>
  </div>
);

export class ComponentsTest implements TestSuite {
  name = "Component Tests";
  private container: HTMLElement;
  private root: ReactDOM.Root;

  constructor() {
    this.container = document.getElementById("app") as HTMLElement;
    this.root = ReactDOM.createRoot(this.container);
  }

  private cleanup() {
    this.root.unmount();
    this.container.innerHTML = "";
    this.root = ReactDOM.createRoot(this.container);
  }

  private runBenchmark(
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

  async *run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown> {
    // Test 1: Simple component mounting
    yield this.runBenchmark(
      "Simple component mount",
      () => {
        this.cleanup();
        const vdom = <SimpleComponent />;
        this.root.render(vdom);
      },
      options
    );

    // Test 2: Complex component mounting
    let complexCounter = 0;
    yield this.runBenchmark(
      "Complex component mount",
      () => {
        this.cleanup();
        complexCounter++;
        const vdom = <ComplexComponent count={complexCounter} />;
        this.root.render(vdom);
      },
      options
    );

    // Test 3: Multiple components
    let multiCounter = 0;
    yield this.runBenchmark(
      "Multiple components mount",
      () => {
        this.cleanup();
        multiCounter++;
        const vdom = (
          <div>
            <SimpleComponent />
            <SimpleComponent />
            <SimpleComponent />
            <ComplexComponent count={multiCounter} />
            <SimpleComponent />
            <SimpleComponent />
          </div>
        );
        this.root.render(vdom);
      },
      options
    );
  }
}
