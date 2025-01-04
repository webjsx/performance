import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBenchmark() {
  // Start the server
  const server = spawn("npm", ["run", "serve"], {
    stdio: "ignore",
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Run the benchmark
    const benchmark = spawn("node", [join(__dirname, "cli.js")], {
      stdio: "inherit",
    });

    await new Promise((resolve, reject) => {
      benchmark.on("exit", (code) => {
        if (code === 0) {
          resolve(null);
        } else {
          reject(new Error(`Benchmark exited with code ${code}`));
        }
      });
    });
  } finally {
    // Clean up
    server.kill();
  }
}

runBenchmark().catch((error) => {
  console.error(error);
  process.exit(1);
});
