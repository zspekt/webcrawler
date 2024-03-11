// crawl.js
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const stripSuffix = (string, suffix) => {
  return string.endsWith(suffix) ? string.slice(0, -suffix.length) : string;
};

const normalizeURL = (url) => {
  try {
    const obj = new URL(url);
    const path = `https://${obj.hostname}${stripSuffix(obj.pathname, "/")}`;
    console.log(`got ${url}, returning ${path}`);
    return path;
  } catch (err) {
    console.log(`Error normalizing -> ${url}`);
    return null;
  }
};

const isRelativeURL = (url) => {
  return url.startsWith("/");
};

const getURLsFromHTML = (html, baseURL) => {
  const dom = new JSDOM(html);
  const urls = [];

  const tagArray = dom.window.document.querySelectorAll("a");
  for (const tag of tagArray) {
    try {
      if (isRelativeURL(tag.href)) {
        urls.push(normalizeURL(new URL(tag.href, baseURL).href));
      } else {
        urls.push(normalizeURL(new URL(tag.href).href));
      }
    } catch (err) {
      console.error(err);
    }
  }
  return urls;
};

const isSameHost = (url1, url2) => {
  const obj1 = new URL(url1).hostname;
  const obj2 = new URL(url2).hostname;
  return obj1 === obj2;
};

const crawlPage = async (currentURL, baseURL, pages) => {
  currentURL = normalizeURL(currentURL);
  console.log(`Starting crawlPage with currentURL -> ${currentURL}\n`);

  if (!isSameHost(currentURL, baseURL)) {
    console.log(
      `${currentURL} not from same host ${baseURL}. returning pages...\n`,
    );
    return;
  }

  if (currentURL in pages) {
    console.log(`${currentURL} already in pages. returning pages...\n`);
    pages[currentURL]++;
    return;
  }

  pages[currentURL] = 1;

  const resp = await fetch(currentURL, {
    method: "GET",
  });
  const contentType = resp.headers.get("content-type");
  if (resp.status >= 400) {
    console.log("http resp >= 400");
  } else if (!contentType.includes("text/html")) {
    console.log(
      `content-type is "${contentType}". does not include "index/html"`,
    );
  }
  const html = await resp.text();

  // console.log(`${html}`);
  let urls = getURLsFromHTML(html, currentURL);
  for (const url of urls) {
    await crawlPage(url, baseURL, pages);
  }
};

module.exports = { crawlPage, normalizeURL };
