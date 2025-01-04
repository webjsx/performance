import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type {
  BenchmarkResult,
  TestSuiteOptions,
} from "bench-utils/dist/types.js";

export class RenderTest extends BaseTestSuite {
  name = "React Basic Render Tests";
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

  async *run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown> {
    // Test 1: Single div with cleanup
    yield this.runTest(
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
    yield this.runTest(
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
    yield this.runTest(
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
    yield this.runTest(
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
    yield this.runTest(
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
    yield this.runTest(
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
