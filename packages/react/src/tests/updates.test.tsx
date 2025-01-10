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
    // Test 1: Toggle class (non-keyed)
    let isActive = false;
    yield {
      name: "Non-keyed class toggle",
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

    // Test 2: Text content updates (non-keyed)
    let counter = 0;
    yield {
      name: "Non-keyed text content updates",
      run: () => {
        counter++;
        const vdom = <div>Counter value: {counter}</div>;
        this.root.render(vdom);
      },
    };

    // Test 3: Simple list reordering with keys
    const baseItems = Array.from({ length: 100 }, (_, i) => i);
    yield {
      name: "Keyed list reordering",
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

    // Test 4: Style updates (non-keyed)
    let styleCounter = 0;
    yield {
      name: "Non-keyed style updates",
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

    // Test 5: Complex keyed object updates
    const baseObjects = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      label: `Item ${i}`,
      values: Array.from({ length: 3 }, (_, j) => ({
        id: `${i}-${j}`,
        count: i * j,
      })),
    }));

    yield {
      name: "Keyed nested object updates",
      run: () => {
        const updatedObjects = baseObjects.map((obj) => ({
          ...obj,
          values: obj.values.map((val) => ({
            ...val,
            count: Math.floor(Math.random() * 1000),
          })),
        }));

        const vdom = (
          <div>
            {updatedObjects.map((obj) => (
              <div key={obj.id} className="item-container">
                <h4>{obj.label}</h4>
                {obj.values.map((val) => (
                  <span key={val.id} className="value">
                    Count: {val.count}
                  </span>
                ))}
              </div>
            ))}
          </div>
        );
        this.root.render(vdom);
      },
    };

    // Test 6: Keyed table row updates
    const baseRows = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      cols: Array.from({ length: 5 }, (_, j) => ({
        id: `${i}-${j}`,
        value: `Cell ${i}-${j}`,
        status: j % 2 === 0 ? "active" : "inactive",
      })),
    }));

    yield {
      name: "Keyed table updates",
      run: () => {
        const updatedRows = baseRows.map((row) => ({
          ...row,
          cols: row.cols.map((col) => ({
            ...col,
            status: Math.random() > 0.5 ? "active" : "inactive",
            value: `Cell ${col.id} (${Math.random().toString(36).slice(2, 6)})`,
          })),
        }));

        const vdom = (
          <table>
            <tbody>
              {updatedRows.map((row) => (
                <tr key={row.id}>
                  {row.cols.map((col) => (
                    <td key={col.id} className={col.status}>
                      {col.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        this.root.render(vdom);
      },
    };

    // Test 7: Selective updates in large list
    let renderCount = 0;
    yield {
      name: "Selective updates in 10000 items",
      run: () => {
        if (renderCount === 11) {
          renderCount = 0;
          return;
        }

        const items = Array.from({ length: 10000 }, (_, i) => {
          const shouldUpdate = renderCount > 0 && i % 10 === renderCount - 1;
          return (
            <div key={i} id={`item-${i}`}>
              Item {i} {shouldUpdate ? `(updated at ${performance.now()})` : ""}
            </div>
          );
        });

        this.root.render(<div className="large-list">{items}</div>);
        renderCount++;
      },
    };
  }
}
