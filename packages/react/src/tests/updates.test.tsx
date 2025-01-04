import * as React from "react";
import * as ReactDOM from "react-dom/client";
import type { TestSuite, BenchmarkResult, TestSuiteOptions } from "../types.js";

export class UpdatesTest implements TestSuite {
  name = "DOM Updates Tests";
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
    // Test 1: Toggle class
    let isActive = false;
    yield this.runBenchmark(
      "Class toggle updates",
      () => {
        isActive = !isActive;
        const vdom = (
          <div className={isActive ? "active" : "inactive"}>
            Toggle class test
          </div>
        );
        this.root.render(vdom);
      },
      options
    );

    // Test 2: Text content updates
    let counter = 0;
    yield this.runBenchmark(
      "Text content updates",
      () => {
        counter++;
        const vdom = <div>Counter value: {counter}</div>;
        this.root.render(vdom);
      },
      options
    );

    // Test 3: List reordering
    const baseItems = Array.from({ length: 100 }, (_, i) => i);
    yield this.runBenchmark(
      "List reordering",
      () => {
        const shuffled = [...baseItems].sort(() => Math.random() - 0.5);
        const vdom = (
          <ul>
            {shuffled.map((num) => (
              <li key={num}>Item {num}</li>
            ))}
          </ul>
        );
        this.root.render(vdom);
      },
      options
    );

    // Test 4: Style updates
    let styleCounter = 0;
    yield this.runBenchmark(
      "Style updates",
      () => {
        styleCounter++;
        const hue = (styleCounter * 10) % 360;
        const vdom = (
          <div
            style={{
              backgroundColor: `hsl(${hue}, 70%, 50%)`,
              padding: `${10 + (styleCounter % 10)}px`,
              fontSize: `${14 + (styleCounter % 8)}px`,
            }}
          >
            Dynamic styles test
          </div>
        );
        this.root.render(vdom);
      },
      options
    );
  }
}
