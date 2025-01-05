import * as webjsx from "webjsx";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type { TestCase } from "bench-utils/dist/types.js";

export class UpdatesTest extends BaseTestSuite {
  name = "WebJSX Updates Tests";

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
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 2: Text content updates
    let counter = 0;
    yield {
      name: "Text content updates",
      run: () => {
        counter++;
        const vdom = <div>Counter value: {counter}</div>;
        webjsx.applyDiff(this.container, vdom);
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
        webjsx.applyDiff(this.container, vdom);
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
            style={`background-color: hsl(${hue}, 70%, 50%); padding: ${
              10 + (styleCounter % 10)
            }px; font-size: ${14 + (styleCounter % 8)}px`}
          >
            Dynamic styles test
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      },
    };
  }
}
