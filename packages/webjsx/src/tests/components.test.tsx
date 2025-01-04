import * as webjsx from "webjsx";
import type { TestSuite, BenchmarkResult } from "../types.js";

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

  async run(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const iterations = 5000;

    // Test 1: Simple component mounting
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = <simple-component />;
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Simple component mount",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 2: Complex component mounting
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = <complex-component count={i.toString()} />;
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Complex component mount",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 3: Multiple components
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = (
          <div>
            <simple-component />
            <simple-component />
            <simple-component />
            <complex-component count={i.toString()} />
            <simple-component />
            <simple-component />
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Multiple components mount",
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
