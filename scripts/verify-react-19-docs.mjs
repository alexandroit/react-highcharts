import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(rootDir, 'docs', 'react-19');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const docsPackageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs-src', 'react-19', 'package.json'), 'utf8'));
const explicitUrl = process.env.STACKLINE_REACT_HIGHCHARTS_URL;
const chromeCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function startServer() {
  if (explicitUrl) {
    return { url: explicitUrl, close: async () => undefined };
  }

  assert.ok(fs.existsSync(path.join(docsDir, 'index.html')), 'Build the React 19 docs before browser testing.');

  const server = http.createServer((request, response) => {
    const requestPath = new URL(request.url || '/', 'http://127.0.0.1').pathname;
    const relativePath = requestPath === '/' ? 'index.html' : decodeURIComponent(requestPath.slice(1));
    const filePath = path.resolve(docsDir, relativePath);

    if (!filePath.startsWith(`${docsDir}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.writeHead(200, { 'content-type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
assert.ok(chrome, 'Chrome or Chromium was not found.');

const server = await startServer();
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const failures = [];
  const firstPartyOrigin = new URL(server.url).origin;

  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const sourceUrl = message.stackTrace()[0]?.url;
    const referencedUrls = message.text().match(/https?:\/\/[^\s'"\)]+/g) || [];
    const referencesOnlyThirdParties = referencedUrls.length > 0 && referencedUrls.every(
      (url) => new URL(url).origin !== firstPartyOrigin
    );

    if (
      (sourceUrl && new URL(sourceUrl).origin === firstPartyOrigin) ||
      (!sourceUrl && !referencesOnlyThirdParties)
    ) {
      failures.push(`console: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (new URL(request.url()).origin === firstPartyOrigin) failures.push(`request: ${request.url()}`);
  });
  page.on('response', (response) => {
    if (new URL(response.url()).origin === firstPartyOrigin && response.status() >= 400) {
      failures.push(`http ${response.status()}: ${response.url()}`);
    }
  });

  const staticUrl = new URL(server.url);
  staticUrl.searchParams.set('view', 'static');
  const response = await page.goto(staticUrl.href, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000
  });
  assert.ok(response?.ok(), `Documentation returned HTTP ${response?.status()}.`);
  await page.waitForSelector('.lazy-chart-mount', { timeout: 90_000 });
  await page.evaluate(async () => {
    const pause = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await pause(60);
    }

    window.scrollTo(0, document.documentElement.scrollHeight);
    await pause(2_000);
  });
  await page.waitForFunction(
    () => document.querySelectorAll('svg.highcharts-root').length >= 45,
    { timeout: 30_000 }
  );

  const result = await page.evaluate(() => ({
    body: document.body.textContent || '',
    chartSvgs: document.querySelectorAll('svg.highcharts-root').length,
    moduleErrors: Array.from(document.querySelectorAll('.module-error'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
  }));

  assert.ok(result.body.includes(`@stackline/react-highcharts ${packageJson.version}`));
  assert.ok(result.body.includes(`React ${docsPackageJson.dependencies.react} runtime`));
  assert.ok(result.body.includes(`Highcharts ${docsPackageJson.dependencies.highcharts}`));
  assert.ok(result.chartSvgs >= 45, `Expected at least 45 rendered charts, received ${result.chartSvgs}.`);
  assert.deepEqual(result.moduleErrors, []);
  assert.deepEqual(failures, []);

  failures.length = 0;
  const liveUrl = new URL(server.url);
  liveUrl.searchParams.delete('view');
  const liveResponse = await page.goto(liveUrl.href, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000
  });
  assert.ok(liveResponse?.ok(), `Live documentation returned HTTP ${liveResponse?.status()}.`);
  await page.waitForSelector('svg.highcharts-root', { visible: true, timeout: 90_000 });

  const liveResult = await page.evaluate(() => ({
    body: document.body.textContent || '',
    chartSvgs: document.querySelectorAll('svg.highcharts-root').length,
    moduleErrors: Array.from(document.querySelectorAll('.module-error'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
  }));

  assert.ok(liveResult.body.includes(`@stackline/react-highcharts ${packageJson.version}`));
  assert.ok(liveResult.chartSvgs >= 1);
  assert.deepEqual(liveResult.moduleErrors, []);
  assert.deepEqual(failures, []);

  console.log(`Browser docs verified: ${result.chartSvgs} static and ${liveResult.chartSvgs} live Highcharts SVGs with no first-party failures.`);
} finally {
  await browser.close();
  await server.close();
}
