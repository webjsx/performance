import * as webjsx from "webjsx";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type { TestCase } from "bench-utils/dist/types.js";

export class RenderTest extends BaseTestSuite {
  name = "WebJSX Basic Render Tests";

  async *getAllTests(): AsyncGenerator<TestCase, void, unknown> {
    // Test 1: Single div with no changes
    yield {
      name: "Single div render (no changes)",
      run: () => {
        const vdom = <div>Hello World</div>;
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 2: Single div without cleanup
    let counter = 0;
    yield {
      name: "Single div render (with content changes)",
      run: () => {
        counter++;
        const vdom = <div>Hello World {counter}</div>;
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 3: Multiple divs at once (1000 divs in one render)
    const divCount = 1000;
    yield {
      name: "1000 divs per render",
      run: () => {
        const vdom = (
          <div>
            {Array.from({ length: divCount }, (_, idx) => (
              <div key={idx}>Div number {idx}</div>
            ))}
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 4: Nested divs (5 levels)
    yield {
      name: "5-level nested divs",
      run: () => {
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
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 5: Large flat list
    yield {
      name: "1000 siblings render",
      run: () => {
        const items = Array.from({ length: 1000 }, (_, index) => (
          <div key={index}>Item {index + 1}</div>
        ));
        const vdom = <div>{items}</div>;
        webjsx.applyDiff(this.container, vdom);
      },
    };

    // Test 6: Mixed content types
    yield {
      name: "Mixed elements render",
      run: () => {
        const vdom = (
          <article>
            <h1>Article Title</h1>
            <p>Text content</p>
            <img src="dummy.jpg" alt="test" />
            <input type="text" placeholder="Enter text" />
            <button type="button">Click me</button>
          </article>
        );
        webjsx.applyDiff(this.container, vdom);
      },
    };
  }
}
