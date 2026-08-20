import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-react-highcharts-'));
const artifactDir = path.join(temporaryRoot, 'artifact');

fs.mkdirSync(artifactDir);

const configuredTarball = process.env.STACKLINE_PACKAGE_TARBALL;
const tarball = configuredTarball
  ? path.resolve(configuredTarball)
  : path.join(
      artifactDir,
      JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', artifactDir], {
        cwd: rootDir,
        encoding: 'utf8'
      }))[0].filename
    );

assert.ok(fs.existsSync(tarball), `Package tarball not found: ${tarball}`);

const matrices = [
  { name: 'legacy-peer-floor', react: '19.0.0', highcharts: '6.2.0' },
  { name: 'previous-highcharts', react: '19.0.0', highcharts: '12.6.0' },
  { name: 'current', react: '19.2.8', highcharts: '13.0.1' }
];

try {
  for (const matrix of matrices) {
    const consumerDir = path.join(temporaryRoot, matrix.name);
    fs.mkdirSync(consumerDir);

    fs.writeFileSync(path.join(consumerDir, 'package.json'), `${JSON.stringify({
      name: `react-highcharts-smoke-${matrix.name}`,
      private: true,
      type: 'module',
      dependencies: {
        '@stackline/react-highcharts': `file:${tarball}`,
        ...(matrix.highcharts.startsWith('6.') ? { '@types/highcharts': '5.0.44' } : {}),
        '@types/react': '19.2.18',
        '@types/react-dom': '19.2.4',
        highcharts: matrix.highcharts,
        react: matrix.react,
        'react-dom': matrix.react,
        typescript: '5.9.3'
      }
    }, null, 2)}\n`);

    fs.writeFileSync(path.join(consumerDir, 'tsconfig.json'), `${JSON.stringify({
      compilerOptions: {
        esModuleInterop: true,
        jsx: 'react-jsx',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: 'ES2020'
      },
      include: ['usage.tsx']
    }, null, 2)}\n`);

    fs.writeFileSync(path.join(consumerDir, 'usage.tsx'), `import { createRef } from 'react';\nimport Highcharts from 'highcharts';\nimport { Chart, exposeHighchartsGlobals, initHighchartsModules, type ChartHandle } from '@stackline/react-highcharts';\n\nconst ref = createRef<ChartHandle>();\nconst options: Highcharts.Options = {\n  title: { text: 'Consumer smoke' },\n  series: [{ type: 'line', data: [1, 2, 3] }]\n};\n\nexposeHighchartsGlobals(Highcharts);\ninitHighchartsModules(Highcharts);\nexport const element = <Chart ref={ref} highcharts={Highcharts} options={options} />;\n`);

    fs.writeFileSync(path.join(consumerDir, 'esm.mjs'), `import { Chart, exposeHighchartsGlobals, initHighchartsModules } from '@stackline/react-highcharts';\nif (Chart?.$$typeof !== Symbol.for('react.forward_ref')) throw new Error('Invalid ESM Chart export.');\nif (typeof exposeHighchartsGlobals !== 'function' || typeof initHighchartsModules !== 'function') throw new Error('Invalid ESM helpers.');\n`);

    fs.writeFileSync(path.join(consumerDir, 'commonjs.cjs'), `const api = require('@stackline/react-highcharts');\nif (api.Chart?.$$typeof !== Symbol.for('react.forward_ref')) throw new Error('Invalid CommonJS Chart export.');\nif (typeof api.exposeHighchartsGlobals !== 'function' || typeof api.initHighchartsModules !== 'function') throw new Error('Invalid CommonJS helpers.');\n`);

    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: consumerDir,
      stdio: 'inherit'
    });
    execFileSync(process.execPath, ['esm.mjs'], { cwd: consumerDir, stdio: 'inherit' });
    execFileSync(process.execPath, ['commonjs.cjs'], { cwd: consumerDir, stdio: 'inherit' });
    execFileSync(path.join(consumerDir, 'node_modules', '.bin', 'tsc'), ['--project', 'tsconfig.json'], {
      cwd: consumerDir,
      stdio: 'inherit'
    });

    console.log(`Consumer verified: React ${matrix.react}, Highcharts ${matrix.highcharts}.`);
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
