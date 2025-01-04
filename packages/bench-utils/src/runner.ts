import { spawn } from "node:child_process";
import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export async function runProductionBenchmark(
  options: { cwd: string } = { cwd: process.cwd() }
) {
  // First build the production version
  const build = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    cwd: options.cwd,
  });

  await new Promise((resolve, reject) => {
    build.on("exit", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });

  // Start the preview server
  const server = spawn("npm", ["run", "preview"], {
    stdio: "ignore",
    cwd: options.cwd,
  });

  // Ensure server cleanup on process termination
  const cleanup = () => {
    server.kill("SIGTERM");
    process.exit(0);
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("exit", cleanup);

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Run benchmarks in browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the local test page
    await page.goto("http://localhost:4173");

    // Set up console log forwarding
    page.on("console", (msg) => console.log(msg.text()));

    // Click the run tests button and wait for results
    await page.click("#run-tests");

    // Wait for results to appear
    await page.waitForSelector("#results pre");

    // Get the results
    const results = await page.$eval("#results pre", (el) => el.textContent);
    console.log(results);

    await browser.close();
  } finally {
    // Cleanup and force exit
    server.kill("SIGTERM");
    // Give the server a moment to cleanup before forcing exit
    setTimeout(() => process.exit(0), 100);
  }
}

if (import.meta.url === fileURLToPath(process.argv[1])) {
  runProductionBenchmark().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
