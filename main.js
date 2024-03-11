// main.js

const { argv } = require("node:process");
const { crawlPage, normalizeURL } = require("./crawl.js");
const { syncBuiltinESMExports } = require("node:module");

async function main() {
  if (argv.length != 3) {
    throw new Error("Invalid number of CLI arguments");
  }
  const baseURL = normalizeURL(argv[2]);

  const pages = new Object();

  console.log(`Webcrawler running with the following URL as base ${baseURL}`);

  await crawlPage(baseURL, baseURL, pages);

  for (const url in pages) {
    console.log(`\n\n${url} -> ${pages[url]}`);
  }
}

main();
