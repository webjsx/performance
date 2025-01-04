import "webjsx";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "simple-component": {
        // No props needed for simple component
      };
      "complex-component": {
        count?: string;
      };
    }
  }
}
