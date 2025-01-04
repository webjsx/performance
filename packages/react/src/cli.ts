import { runProductionBenchmark } from "bench-utils/dist/runner.js";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use production benchmark runner
runProductionBenchmark({ cwd: dirname(__dirname) }).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
