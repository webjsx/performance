import * as webjsx from "webjsx";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type {
  BenchmarkResult,
  TestSuiteOptions,
} from "bench-utils/dist/types.js";

export class UpdatesTest extends BaseTestSuite {
  name = "WebJSX Updates Tests";

  async *run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown> {
    // Test 1: Toggle class
    let isActive = false;
    yield this.runTest(
      "Class toggle updates",
      () => {
        isActive = !isActive;
        const vdom = (
          <div className={isActive ? "active" : "inactive"}>
            Toggle class test
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 2: Text content updates
    let counter = 0;
    yield this.runTest(
      "Text content updates",
      () => {
        counter++;
        const vdom = <div>Counter value: {counter}</div>;
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 3: List reordering
    const baseItems = Array.from({ length: 100 }, (_, i) => i);
    yield this.runTest(
      "List reordering",
      () => {
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
      options
    );

    // Test 4: Style updates
    let styleCounter = 0;
    yield this.runTest(
      "Style updates",
      () => {
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
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );
  }
}
