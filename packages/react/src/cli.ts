import { runBrowserBenchmarks } from "bench-utils/dist/cli.js";

runBrowserBenchmarks().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
