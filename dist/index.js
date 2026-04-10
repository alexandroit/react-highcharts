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
var Chart = forwardRef(function Chart2({
  highcharts,
  options,
  constructorType = "chart",
  onChartReady,
  allowChartUpdate = true,
  immutable = false,
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
      onReadyRef.current?.(chart);
    });
    skipNextUpdateRef.current = true;
  }
  function scheduleReflow() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      chartRef.current?.reflow();
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
    chart.update(options, updateArgs[0], updateArgs[1], updateArgs[2]);
  }, [
    options,
    allowChartUpdate,
    immutable,
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