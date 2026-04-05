import type Highcharts from 'highcharts';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type HTMLAttributes
} from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type ConstructorType = 'chart' | 'stockChart' | 'mapChart' | 'ganttChart';

export interface ChartHandle {
  chart: Highcharts.Chart | null;
  container: HTMLDivElement | null;
}

export interface ChartProps {
  highcharts: typeof Highcharts;
  options: Highcharts.Options;
  constructorType?: ConstructorType;
  onChartReady?: (chart: Highcharts.Chart) => void;
  allowChartUpdate?: boolean;
  immutable?: boolean;
  updateArgs?: [
    redraw?: boolean,
    oneToOne?: boolean,
    animation?: boolean | Partial<Highcharts.AnimationOptionsObject>
  ];
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export const Chart = forwardRef<ChartHandle, ChartProps>(function Chart(
  {
    highcharts,
    options,
    constructorType = 'chart',
    onChartReady,
    allowChartUpdate = true,
    immutable = false,
    updateArgs = [true, true, true],
    containerProps
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const skipNextUpdateRef = useRef(true);
  const onReadyRef = useRef(onChartReady);
  const frameRef = useRef<number | null>(null);

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

    const factory = (highcharts as unknown as Record<string, unknown>)[constructorType];

    if (typeof factory !== 'function') {
      throw new Error(
        `Unknown Highcharts constructor "${constructorType}". ` +
          'Make sure you passed the right Highcharts bundle.'
      );
    }

    destroyChart();

    chartRef.current = (
      factory as (
        container: HTMLElement,
        options: Highcharts.Options,
        callback?: (chart: Highcharts.Chart) => void
      ) => Highcharts.Chart
    )(containerRef.current, options, (chart) => {
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

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
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

  return (
    <div
      {...containerProps}
      ref={containerRef}
      style={{
        width: '100%',
        minWidth: 0,
        ...containerProps?.style
      }}
    />
  );
});
