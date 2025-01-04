import * as webjsx from "webjsx";
import type { TestSuite, BenchmarkResult } from "../types.js";

export class UpdatesTest implements TestSuite {
  name = "WebJSX Updates Tests";
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("app") as HTMLElement;
  }

  private cleanup() {
    this.container.innerHTML = "";
  }

  async run(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    const iterations = 1000;

    // Test 1: Toggle class
    {
      const start = performance.now();
      let isActive = false;

      for (let i = 0; i < iterations; i++) {
        isActive = !isActive;
        const vdom = (
          <div className={isActive ? "active" : "inactive"}>
            Toggle class test
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Class toggle updates",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 2: Text content updates
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        const vdom = <div>Counter value: {i}</div>;
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Text content updates",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 3: List reordering
    {
      const start = performance.now();
      const baseItems = Array.from({ length: 100 }, (_, i) => i);

      for (let i = 0; i < iterations; i++) {
        const shuffled = [...baseItems].sort(() => Math.random() - 0.5);
        const vdom = (
          <ul>
            {shuffled.map((num) => (
              <li key={num}>Item {num}</li>
            ))}
          </ul>
        );
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "List reordering",
        hz: iterations / ((end - start) / 1000),
        stats: {
          mean: (end - start) / iterations,
          deviation: 0,
        },
      });
    }

    // Test 4: Style updates
    {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        const hue = (i * 10) % 360;
        const vdom = (
          <div
            style={{
              backgroundColor: `hsl(${hue}, 70%, 50%)`,
              padding: `${10 + (i % 10)}px`,
              fontSize: `${14 + (i % 8)}px`,
            }}
          >
            Dynamic styles test
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      }
      const end = performance.now();

      results.push({
        name: "Style updates",
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
