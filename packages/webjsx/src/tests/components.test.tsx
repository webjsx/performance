import * as webjsx from "webjsx";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type {
  BenchmarkResult,
  TestSuiteOptions,
} from "bench-utils/dist/types.js";

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

export class ComponentsTest extends BaseTestSuite {
  name = "WebJSX Component Tests";

  async *run(
    options: TestSuiteOptions
  ): AsyncGenerator<BenchmarkResult, void, unknown> {
    // Test 1: Simple component mounting
    yield this.runTest(
      "Simple component mount",
      () => {
        this.cleanup();
        const vdom = <simple-component />;
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 2: Complex component mounting
    let counter = 0;
    yield this.runTest(
      "Complex component mount",
      () => {
        this.cleanup();
        counter++;
        const vdom = <complex-component count={counter.toString()} />;
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );

    // Test 3: Multiple components
    let multiCounter = 0;
    yield this.runTest(
      "Multiple components mount",
      () => {
        this.cleanup();
        multiCounter++;
        const vdom = (
          <div>
            <simple-component />
            <simple-component />
            <simple-component />
            <complex-component count={multiCounter.toString()} />
            <simple-component />
            <simple-component />
          </div>
        );
        webjsx.applyDiff(this.container, vdom);
      },
      options
    );
  }
}
