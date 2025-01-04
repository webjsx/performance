import * as React from "react";
import * as ReactDOM from "react-dom/client";
import type { TestSuite, BenchmarkResult } from "../../shared/types.js";

export class SimpleElementsTest implements TestSuite {
  name = "Simple Elements Initial Render";
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

  async run(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const iterations = 1000;

    // Test 1: Single div
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = <div>Hello World</div>;
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "Single div render",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 2: Nested divs
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = (
          <div>
            <div>
              <div>Deep nested</div>
            </div>
          </div>
        );
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "Nested divs render",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    return results;
  }
}
