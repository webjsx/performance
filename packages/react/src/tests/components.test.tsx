import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BaseTestSuite } from "bench-utils/dist/base-test-suite.js";
import type { TestCase } from "bench-utils/dist/types.js";

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

  async *getAllTests(): AsyncGenerator<TestCase, void, unknown> {
    // Test 1: Simple component mounting
    yield {
      name: "Simple component mount",
      run: () => {
        const vdom = <SimpleComponent />;
        this.root.render(vdom);
      },
    };

    // Test 2: Complex component mounting
    let complexCounter = 0;
    yield {
      name: "Complex component mount",
      run: () => {
        complexCounter++;
        const vdom = <ComplexComponent count={complexCounter} />;
        this.root.render(vdom);
      },
    };

    // Test 3: Multiple components
    let multiCounter = 0;
    yield {
      name: "Multiple components mount",
      run: () => {
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
    };
  }
}
