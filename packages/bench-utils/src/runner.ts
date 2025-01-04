import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { BenchmarkOptions } from "./types.js";

export async function runProductionBenchmark(
  options: BenchmarkOptions = { duration: 2, cwd: process.cwd() }
) {
  const { duration = 2, cwd = process.cwd() } = options;

  // First build the production version
  const build = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    cwd,
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
    cwd,
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

    // Set duration in the page
    await page.$eval(
      "#duration",
      (el, dur) => {
        (el as HTMLInputElement).value = dur.toString();
      },
      duration
    );

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

if (import.meta.url.startsWith("file:")) {
  const scriptPath = fileURLToPath(import.meta.url);
  if (scriptPath === process.argv[1]) {
    const args = process.argv.slice(2);
    const durationArg = args.find(
      (arg) => arg.startsWith("--duration=") || arg.startsWith("-d=")
    );
    const duration = durationArg ? parseFloat(durationArg.split("=")[1]) : 2;

    runProductionBenchmark({ duration }).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }
}
