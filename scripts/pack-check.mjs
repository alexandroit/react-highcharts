import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

assert.equal(packageJson.name, '@stackline/react-highcharts');
assert.equal(packageJson.version, '19.1.1');
assert.equal(packageJson.peerDependencies.highcharts, '>=6.0.0 <=13.0.2');
assert.equal(packageJson.peerDependencies.react, '>=19.0.0 <20.0.0');
assert.equal(packageJson.peerDependencies['react-dom'], '>=19.0.0 <20.0.0');
assert.equal(packageJson.exports['.'].import.types, './dist/index.d.ts');
assert.equal(packageJson.exports['.'].import.default, './dist/index.js');
assert.equal(packageJson.exports['.'].require.types, './dist/index.d.cts');
assert.equal(packageJson.exports['.'].require.default, './dist/index.cjs');

for (const field of ['main', 'module', 'types']) {
  assert.ok(fs.existsSync(path.resolve(rootDir, packageJson[field])), `${field} target is missing.`);
}

const pack = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: rootDir,
  encoding: 'utf8'
}))[0];
const files = pack.files.map((entry) => entry.path);

for (const expected of [
  'LICENSE',
  'README.md',
  'CHANGELOG.md',
  'SECURITY.md',
  'dist/index.cjs',
  'dist/index.js',
  'dist/index.d.cts',
  'dist/index.d.ts'
]) {
  assert.ok(files.includes(expected), `${expected} is missing from the package.`);
}

assert.ok(files.every((file) => !file.startsWith('src/') && !file.startsWith('tests/')));

const require = createRequire(import.meta.url);
const commonJs = require(path.resolve(rootDir, packageJson.main));
const esm = await import(pathToFileURL(path.resolve(rootDir, packageJson.module)));

for (const exportName of ['exposeHighchartsGlobals', 'initHighchartsModules']) {
  assert.equal(typeof commonJs[exportName], 'function');
  assert.equal(typeof esm[exportName], 'function');
}

for (const chartExport of [commonJs.Chart, esm.Chart]) {
  assert.equal(typeof chartExport, 'object');
  assert.equal(chartExport.$$typeof, Symbol.for('react.forward_ref'));
  assert.equal(typeof chartExport.render, 'function');
}

const declarations = fs.readFileSync(path.resolve(rootDir, packageJson.types), 'utf8');
for (const publicName of ['ChartHandle', 'ChartProps', 'ConstructorType', 'HighchartsModuleFactory']) {
  assert.match(declarations, new RegExp(`\\b${publicName}\\b`));
}

console.log(`Package archive verified: ${pack.filename}, ${files.length} files.`);
