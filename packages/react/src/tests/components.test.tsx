import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type {
  BenchmarkResult,
  TestSuiteOptions,
} from "bench-utils/dist/types.js";

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

export class ComponentsTest extends BaseTestSuite {
  name = "Component Tests";
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
    // Test 1: Simple component mounting
    yield this.runTest(
      "Simple component mount",
      () => {
        this.cleanup();
        const vdom = <SimpleComponent />;
        this.root.render(vdom);
      },
      options
    );

    // Test 2: Complex component mounting
    let complexCounter = 0;
    yield this.runTest(
      "Complex component mount",
      () => {
        this.cleanup();
        complexCounter++;
        const vdom = <ComplexComponent count={complexCounter} />;
        this.root.render(vdom);
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
            <SimpleComponent />
            <SimpleComponent />
            <SimpleComponent />
            <ComplexComponent count={multiCounter} />
            <SimpleComponent />
            <SimpleComponent />
          </div>
        );
        this.root.render(vdom);
      },
      options
    );
  }
}
