import assert from 'node:assert/strict';
import test from 'node:test';
import { exposeHighchartsGlobals, initHighchartsModules } from '../dist/index.js';

test('module helpers expose the shared instance and initialize each factory once', () => {
  const previousHighcharts = globalThis.Highcharts;
  const previousInternalHighcharts = globalThis._Highcharts;
  const highcharts = {};
  let directCalls = 0;
  let defaultCalls = 0;

  const directFactory = (instance) => {
    directCalls += 1;
    assert.equal(instance, highcharts);
  };
  const defaultFactory = (instance) => {
    defaultCalls += 1;
    assert.equal(instance, highcharts);
  };

  try {
    exposeHighchartsGlobals(highcharts);
    assert.equal(globalThis.Highcharts, highcharts);
    assert.equal(globalThis._Highcharts, highcharts);

    initHighchartsModules(highcharts, directFactory, { default: defaultFactory });
    initHighchartsModules(highcharts, directFactory, { default: defaultFactory });

    assert.equal(directCalls, 1);
    assert.equal(defaultCalls, 1);
  } finally {
    if (previousHighcharts === undefined) delete globalThis.Highcharts;
    else globalThis.Highcharts = previousHighcharts;

    if (previousInternalHighcharts === undefined) delete globalThis._Highcharts;
    else globalThis._Highcharts = previousInternalHighcharts;
  }
});

test('a failed module factory is not marked as initialized', () => {
  const highcharts = {};
  let calls = 0;
  const factory = () => {
    calls += 1;
    throw new Error('module failed');
  };

  assert.throws(() => initHighchartsModules(highcharts, factory), /module failed/);
  assert.throws(() => initHighchartsModules(highcharts, factory), /module failed/);
  assert.equal(calls, 2);
});
