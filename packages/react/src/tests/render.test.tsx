import * as ReactDOM from "react-dom/client";
import type { BenchmarkResult, TestSuite, TestSuiteOptions } from "../types.js";

export class RenderTest implements TestSuite {
  name = "Basic Render Tests";
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
    // Test 1: Single div with cleanup
    yield this.runBenchmark(
      "Single div render (with cleanup)",
      () => {
        this.cleanup();
        const vdom = <div>Hello World</div>;
        this.root.render(vdom);
      },
      options
    );

    // Test 2: Single div without cleanup
    this.cleanup();
    yield this.runBenchmark(
      "Single div render (no cleanup)",
      () => {
        const vdom = <div>Hello World</div>;
        this.root.render(vdom);
      },
      options
    );

    // Test 3: Multiple divs at once (1000 divs in one render)
    this.cleanup();
    const divCount = 1000;
    yield this.runBenchmark(
      "1000 divs per render",
      () => {
        const vdom = (
          <div>
            {Array.from({ length: divCount }, (_, idx) => (
              <div key={idx}>Div number {idx}</div>
            ))}
          </div>
        );
        this.root.render(vdom);
      },
      options
    );

    // Test 4: Nested divs (5 levels)
    yield this.runBenchmark(
      "5-level nested divs",
      () => {
        this.cleanup();
        const vdom = (
          <div>
            <div>
              <div>
                <div>
                  <div>Deep nested (5 levels)</div>
                </div>
              </div>
            </div>
          </div>
        );
        this.root.render(vdom);
      },
      options
    );

    // Test 5: Large flat list
    yield this.runBenchmark(
      "1000 siblings render",
      () => {
        this.cleanup();
        const items = Array.from({ length: 1000 }, (_, index) => (
          <div key={index}>Item {index + 1}</div>
        ));
        const vdom = <div>{items}</div>;
        this.root.render(vdom);
      },
      options
    );

    // Test 6: Mixed content types
    yield this.runBenchmark(
      "Mixed elements render",
      () => {
        this.cleanup();
        const vdom = (
          <article>
            <h1>Article Title</h1>
            <p>Text content</p>
            <img src="dummy.jpg" alt="test" />
            <input type="text" placeholder="Enter text" />
            <button type="button">Click me</button>
          </article>
        );
        this.root.render(vdom);
      },
      options
    );
  }
}
