"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Chart: () => Chart,
  exposeHighchartsGlobals: () => exposeHighchartsGlobals,
  initHighchartsModules: () => initHighchartsModules
});
module.exports = __toCommonJS(index_exports);

// src/Chart.tsx
var import_react2 = require("react");

// src/useIsomorphicLayoutEffect.ts
var import_react = require("react");
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;

// src/Chart.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function sanitizeChartDom(chart) {
  const container = chart?.container;
  if (!container?.querySelectorAll) {
    return;
  }
  container.querySelectorAll('[visibility="NaN"]').forEach((element) => {
    element.removeAttribute("visibility");
  });
}
function asArray(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
function updateAxes(axes, nextOptions) {
  const options = asArray(nextOptions);
  axes?.forEach((axis, index) => {
    const axisOptions = options[index];
    if (axisOptions) {
      axis.update(axisOptions, false);
    }
  });
}
function updateSeriesData(chart, options) {
  const nextSeries = asArray(options.series);
  if (!nextSeries.length || nextSeries.length !== chart.series.length) {
    return false;
  }
  for (let index = 0; index < nextSeries.length; index += 1) {
    const series = chart.series[index];
    const seriesOptions = nextSeries[index];
    const nextType = "type" in seriesOptions ? seriesOptions.type : void 0;
    if (nextType && series.type !== nextType) {
      return false;
    }
    if (!("data" in seriesOptions)) {
      return false;
    }
  }
  chart.setTitle(options.title, options.subtitle, false);
  updateAxes(chart.xAxis, options.xAxis);
  updateAxes(chart.yAxis, options.yAxis);
  updateAxes(chart.colorAxis, options.colorAxis);
  nextSeries.forEach((seriesOptions, index) => {
    chart.series[index].setData(
      seriesOptions.data || [],
      false,
      false,
      false
    );
  });
  chart.redraw(false);
  return true;
}
var Chart = (0, import_react2.forwardRef)(function Chart2({
  highcharts,
  options,
  constructorType = "chart",
  onChartReady,
  allowChartUpdate = true,
  immutable = false,
  updateMode = "options",
  updateArgs = [true, true, true],
  containerProps
}, ref) {
  const containerRef = (0, import_react2.useRef)(null);
  const chartRef = (0, import_react2.useRef)(null);
  const skipNextUpdateRef = (0, import_react2.useRef)(true);
  const onReadyRef = (0, import_react2.useRef)(onChartReady);
  const frameRef = (0, import_react2.useRef)(null);
  onReadyRef.current = onChartReady;
  (0, import_react2.useImperativeHandle)(
    ref,
    () => ({
      chart: chartRef.current,
      container: containerRef.current
    }),
    []
  );
  function destroyChart() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    chartRef.current?.destroy();
    chartRef.current = null;
  }
  function createChart() {
    if (!containerRef.current) {
      return;
    }
    const factory = highcharts[constructorType];
    if (typeof factory !== "function") {
      throw new Error(
        `Unknown Highcharts constructor "${constructorType}". Make sure you passed the right Highcharts bundle.`
      );
    }
    destroyChart();
    chartRef.current = factory(containerRef.current, options, (chart) => {
      sanitizeChartDom(chart);
      onReadyRef.current?.(chart);
    });
    sanitizeChartDom(chartRef.current);
    skipNextUpdateRef.current = true;
    scheduleReflow();
  }
  function scheduleReflow() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      chartRef.current?.reflow();
      sanitizeChartDom(chartRef.current);
    });
  }
  useIsomorphicLayoutEffect(() => {
    createChart();
    return () => {
      destroyChart();
    };
  }, [highcharts, constructorType]);
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const handleResize = () => {
      scheduleReflow();
    };
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useIsomorphicLayoutEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }
    if (skipNextUpdateRef.current) {
      skipNextUpdateRef.current = false;
      return;
    }
    if (immutable) {
      createChart();
      return;
    }
    if (!allowChartUpdate) {
      return;
    }
    if (updateMode === "series-data" && updateSeriesData(chart, options)) {
      sanitizeChartDom(chart);
      return;
    }
    chart.update(options, updateArgs[0], updateArgs[1], updateArgs[2]);
    sanitizeChartDom(chart);
  }, [
    options,
    allowChartUpdate,
    immutable,
    updateMode,
    updateArgs[0],
    updateArgs[1],
    updateArgs[2]
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ...containerProps,
      ref: containerRef,
      style: {
        width: "100%",
        minWidth: 0,
        ...containerProps?.style
      }
    }
  );
});

// src/modules.ts
var appliedModules = /* @__PURE__ */ new WeakMap();
function exposeHighchartsGlobals(highcharts) {
  const scope = globalThis;
  scope.Highcharts = highcharts;
  scope._Highcharts = highcharts;
}
function initHighchartsModules(highcharts, ...modules) {
  exposeHighchartsGlobals(highcharts);
  const registry = appliedModules.get(highcharts) ?? /* @__PURE__ */ new Set();
  for (const entry of modules) {
    const factory = entry.default ?? entry;
    if (registry.has(factory)) {
      continue;
    }
    if (typeof factory === "function") {
      factory(highcharts);
      registry.add(factory);
    }
  }
  appliedModules.set(highcharts, registry);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules
});
//# sourceMappingURL=index.cjs.map