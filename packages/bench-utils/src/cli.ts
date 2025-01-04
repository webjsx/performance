import puppeteer from "puppeteer";

export async function runBrowserBenchmarks(duration = 2) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the local test page
  await page.goto("http://localhost:8080");

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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const durationArg = args.find(
    (arg) => arg.startsWith("--duration=") || arg.startsWith("-d=")
  );
  const duration = durationArg ? parseFloat(durationArg.split("=")[1]) : 2;

  runBrowserBenchmarks(duration).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
