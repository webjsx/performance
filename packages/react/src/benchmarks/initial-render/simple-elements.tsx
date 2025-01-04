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
    const iterations = 10000;

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

    // Test 3: List rendering
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const items = Array.from({ length: 100 }, (_, index) => (
          <li key={index}>Item {index + 1}</li>
        ));
        const vdom = <ul>{items}</ul>;
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "100 item list render",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 4: Text content with styling
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = (
          <div>
            <h1 style={{ color: "blue", fontSize: "24px" }}>Title</h1>
            <p style={{ color: "gray", marginBottom: "10px" }}>
              This is a paragraph with some styled text content that needs to be
              rendered. It contains multiple text nodes and inline styles to
              test text rendering performance.
            </p>
            <p style={{ fontWeight: "bold" }}>
              Here is another paragraph with different styling applied to test
              style application performance.
            </p>
          </div>
        );
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "Styled text content render",
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
