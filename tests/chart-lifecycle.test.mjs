import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart } from '../dist/index.js';

function installDom() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    pretendToBeVisual: true,
    url: 'http://localhost/'
  });
  const descriptors = new Map();
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    requestAnimationFrame: (callback) => dom.window.setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => dom.window.clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true
  };

  for (const [key, value] of Object.entries(globals)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value
    });
  }

  return {
    dom,
    restore() {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) {
          Object.defineProperty(globalThis, key, descriptor);
        } else {
          delete globalThis[key];
        }
      }
      dom.window.close();
    }
  };
}

function createFakeHighcharts() {
  const instances = [];

  const highcharts = {
    chart(container, options, callback) {
      const instance = {
        container,
        options,
        destroyed: false,
        series: [],
        xAxis: [],
        yAxis: [],
        destroy() {
          this.destroyed = true;
        },
        redraw() {},
        reflow() {},
        setTitle() {},
        update(nextOptions) {
          this.options = nextOptions;
        }
      };

      instances.push(instance);
      callback?.(instance);
      return instance;
    }
  };

  return { highcharts, instances };
}

test('Chart keeps its imperative handle live and applies every immutable update', async () => {
  const environment = installDom();

  try {
    const rootElement = document.getElementById('root');
    const root = createRoot(rootElement);
    const chartRef = createRef();
    const readyCharts = [];
    const { highcharts, instances } = createFakeHighcharts();

    await act(async () => {
      root.render(React.createElement(Chart, {
        ref: chartRef,
        highcharts,
        options: { title: { text: 'Initial' } },
        onChartReady: (chart) => readyCharts.push(chart)
      }));
    });

    assert.equal(instances.length, 1);
    assert.equal(chartRef.current.chart, instances[0]);
    assert.equal(chartRef.current.container, rootElement.firstElementChild);

    await act(async () => {
      root.render(React.createElement(Chart, {
        ref: chartRef,
        highcharts,
        immutable: true,
        options: { title: { text: 'Immutable one' } },
        onChartReady: (chart) => readyCharts.push(chart)
      }));
    });

    assert.equal(instances.length, 2);
    assert.equal(instances[0].destroyed, true);
    assert.equal(chartRef.current.chart, instances[1]);

    await act(async () => {
      root.render(React.createElement(Chart, {
        ref: chartRef,
        highcharts,
        immutable: true,
        options: { title: { text: 'Immutable two' } },
        onChartReady: (chart) => readyCharts.push(chart)
      }));
    });

    assert.equal(instances.length, 3);
    assert.equal(instances[1].destroyed, true);
    assert.equal(chartRef.current.chart, instances[2]);
    assert.deepEqual(readyCharts, instances);

    const handle = chartRef.current;
    await act(async () => root.unmount());

    assert.equal(instances[2].destroyed, true);
    assert.equal(handle.chart, null);
    assert.equal(handle.container, null);
  } finally {
    environment.restore();
  }
});
