import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type { TestCase } from "bench-utils/dist/types.js";

export class UpdatesTest extends BaseTestSuite {
  name = "React DOM Updates Tests";
  private root: ReactDOM.Root;

  constructor() {
    super();
    this.root = ReactDOM.createRoot(this.container);
  }

  protected cleanup() {
    this.root.unmount();
    this.container.innerHTML = "";
    this.root = ReactDOM.createRoot(this.container);
  }

  async *getAllTests(): AsyncGenerator<TestCase, void, unknown> {
    // Test 1: Toggle class
    let isActive = false;
    yield {
      name: "Class toggle updates",
      run: () => {
        isActive = !isActive;
        const vdom = (
          <div className={isActive ? "active" : "inactive"}>
            Toggle class test
          </div>
        );
        this.root.render(vdom);
      },
    };

    // Test 2: Text content updates
    let counter = 0;
    yield {
      name: "Text content updates",
      run: () => {
        counter++;
        const vdom = <div>Counter value: {counter}</div>;
        this.root.render(vdom);
      },
    };

    // Test 3: List reordering
    const baseItems = Array.from({ length: 100 }, (_, i) => i);
    yield {
      name: "List reordering",
      run: () => {
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
    };

    // Test 4: Style updates
    let styleCounter = 0;
    yield {
      name: "Style updates",
      run: () => {
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
    };
  }
}
