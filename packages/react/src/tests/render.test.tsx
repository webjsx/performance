import * as React from "react";
import * as ReactDOM from "react-dom/client";
import type { TestSuite, BenchmarkResult } from "../types.js";

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

  async run(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const iterations = 10000;

    // Test 1: Single div with cleanup (original)
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = <div>Hello World</div>;
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "Single div render (with cleanup)",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 2: Single div without cleanup
    {
      this.cleanup(); // Initial cleanup
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        const vdom = <div>Hello World {i}</div>;
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "Single div render (no cleanup)",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 3: Multiple divs at once (1000 divs in one render)
    {
      this.cleanup();
      const divCount = 1000;
      const start = performance.now();
      for (let i = 0; i < iterations / 100; i++) {
        const vdom = (
          <div>
            {Array.from({ length: divCount }, (_, idx) => (
              <div key={idx}>Div number {idx}</div>
            ))}
          </div>
        );
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "1000 divs per render",
        hz: iterations / 100 / ((end - start) / 1000),
        stats: {
          mean: (end - start) / (iterations / 100),
          deviation: 0,
        },
      });
    }

    // Test 4: Nested divs (5 levels)
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
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
      }
      const end = performance.now();

      results.push({
        name: "5-level nested divs",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 5: Large flat list
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const items = Array.from({ length: 1000 }, (_, index) => (
          <div key={index}>Item {index + 1}</div>
        ));
        const vdom = <div>{items}</div>;
        this.root.render(vdom);
      }
      const end = performance.now();

      results.push({
        name: "1000 siblings render",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 6: Mixed content types
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
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
      }
      const end = performance.now();

      results.push({
        name: "Mixed elements render",
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
