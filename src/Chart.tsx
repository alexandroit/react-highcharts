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

  return <div {...containerProps} ref={containerRef} />;
});
