// src/Chart.tsx
import {
  forwardRef,
  useImperativeHandle,
  useRef
} from "react";

// src/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// src/Chart.tsx
import { jsx } from "react/jsx-runtime";
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
var Chart = forwardRef(function Chart2({
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
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const skipNextUpdateRef = useRef(true);
  const onReadyRef = useRef(onChartReady);
  const frameRef = useRef(null);
  onReadyRef.current = onChartReady;
  useImperativeHandle(
    ref,
    () => {
      const handle = {};
      Object.defineProperties(handle, {
        chart: {
          enumerable: true,
          get: () => chartRef.current
        },
        container: {
          enumerable: true,
          get: () => containerRef.current
        }
      });
      return handle;
    },
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
      skipNextUpdateRef.current = false;
      return;
    }
    if (!allowChartUpdate) {
      return;
    }
    if (updateMode === "series-data" && updateSeriesData(chart, options)) {
      sanitizeChartDom(chart);
      return;
    }
    chart.update(
      options,
      updateArgs[0],
      updateArgs[1],
      updateArgs[2]
    );
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
  return /* @__PURE__ */ jsx(
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
export {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules
};
//# sourceMappingURL=index.js.map