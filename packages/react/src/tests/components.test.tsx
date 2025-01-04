import * as React from "react";
import * as ReactDOM from "react-dom/client";
import type { TestSuite, BenchmarkResult } from "../types.js";

// Test components
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

  async run(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const iterations = 5000;

    // Test 1: Simple component mounting
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        this.cleanup();
        const vdom = <SimpleComponent />;
        this.root.render(vdom);
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
        const vdom = <ComplexComponent count={i} />;
        this.root.render(vdom);
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
            <SimpleComponent />
            <SimpleComponent />
            <SimpleComponent />
            <ComplexComponent count={i} />
            <SimpleComponent />
            <SimpleComponent />
          </div>
        );
        this.root.render(vdom);
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
