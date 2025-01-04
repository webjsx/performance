import { runProductionBenchmark } from "bench-utils/dist/runner.js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

runProductionBenchmark({ cwd: dirname(__dirname) }).catch((error: any) => {
  console.error(error);
  process.exit(1);
});
