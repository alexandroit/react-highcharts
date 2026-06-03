const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const htmlFiles = ["docs-src/react-17/index.html"];
const themeFiles = ["docs-src/react-17/src/app.css"];
const expectedStrings = ["@stackline/react-highcharts"];
const themeMarker = /React 17 compatibility layer over the Angular 21 Highcharts shell/;

for (const relativePath of htmlFiles) {
  test(`html smoke: ${relativePath}`, () => {
    const filePath = path.join(repoRoot, relativePath);
    const html = fs.readFileSync(filePath, "utf8");
    assert.match(html, /meta name="viewport"/i);
    assert.match(html, /<div id="root"><\/div>/i);
    assert.match(html, /\/src\/main\.tsx/i);
    assert.doesNotMatch(html, /pagead2\.googlesyndication\.com/i);
    assert.doesNotMatch(html, /googletagmanager\.com/i);
    for (const expected of expectedStrings) {
      assert.equal(html.includes(expected), true);
    }
  });
}

for (const relativePath of themeFiles) {
  test(`theme smoke: ${relativePath}`, () => {
    const filePath = path.join(repoRoot, relativePath);
    const source = fs.readFileSync(filePath, "utf8");
    assert.match(source, themeMarker);
  });
}
