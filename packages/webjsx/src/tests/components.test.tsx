import * as webjsx from "webjsx";
import type { TestSuite, BenchmarkResult, TestSuiteOptions } from "../types.js";

// Test components (using Web Components)
class SimpleComponent extends HTMLElement {
  connectedCallback() {
    const vdom = <div>Simple component</div>;
    webjsx.applyDiff(this, vdom);
  }
}

class ComplexComponent extends HTMLElement {
  static get observedAttributes() {
    return ["count"];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const vdom = (
      <div className="complex">
        <header>
          <h1>Complex Component</h1>
          <p>Count: {this.getAttribute("count")}</p>
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
    webjsx.applyDiff(this, vdom);
  }
}

// Register components
if (!customElements.get("simple-component")) {
  customElements.define("simple-component", SimpleComponent);
}
if (!customElements.get("complex-component")) {
  customElements.define("complex-component", ComplexComponent);
}

export class ComponentsTest implements TestSuite {
  name = "WebJSX Component Tests";
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("app") as HTMLElement;
  }

  private cleanup() {
    this.container.innerHTML = "";
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
    options.onTestStart?.("Simple component mount");
    yield this.runBenchmark(
      "Simple component mount",
      () => {
        this.cleanup();
        const vdom = <simple-component />;
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 2: Complex component mounting
    options.onTestStart?.("Complex component mount");
    let counter = 0;
    yield this.runBenchmark(
      "Complex component mount",
      () => {
        this.cleanup();
        counter++;
        const vdom = <complex-component count={counter.toString()} />;
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 3: Multiple components
    options.onTestStart?.("Multiple components mount");
    let multiCounter = 0;
    yield this.runBenchmark(
      "Multiple components mount",
      () => {
        this.cleanup();
        multiCounter++;
        const vdom = (
          <div>
            <simple-component />
            <simple-component />
            <simple-component />
            <complex-component count={multiCounter.toString()} />
            <simple-component />
            <simple-component />
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );
  }
}
