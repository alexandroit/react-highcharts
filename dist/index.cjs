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
var Chart = (0, import_react2.forwardRef)(function Chart2({
  highcharts,
  options,
  constructorType = "chart",
  onChartReady,
  allowChartUpdate = true,
  immutable = false,
  updateArgs = [true, true, true],
  containerProps
}, ref) {
  const containerRef = (0, import_react2.useRef)(null);
  const chartRef = (0, import_react2.useRef)(null);
  const skipNextUpdateRef = (0, import_react2.useRef)(true);
  const onReadyRef = (0, import_react2.useRef)(onChartReady);
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
      onReadyRef.current?.(chart);
    });
    skipNextUpdateRef.current = true;
  }
  useIsomorphicLayoutEffect(() => {
    createChart();
    return () => {
      destroyChart();
    };
  }, [highcharts, constructorType]);
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
    chart.update(options, updateArgs[0], updateArgs[1], updateArgs[2]);
  }, [
    options,
    allowChartUpdate,
    immutable,
    updateArgs[0],
    updateArgs[1],
    updateArgs[2]
  ]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ...containerProps, ref: containerRef });
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