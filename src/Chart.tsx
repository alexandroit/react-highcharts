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
  updateMode?: 'options' | 'series-data';
  updateArgs?: [
    redraw?: boolean,
    oneToOne?: boolean,
    animation?: boolean | object
  ];
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

function sanitizeChartDom(chart: Highcharts.Chart | null) {
  const container = chart?.container;

  if (!container?.querySelectorAll) {
    return;
  }

  container.querySelectorAll('[visibility="NaN"]').forEach((element) => {
    element.removeAttribute('visibility');
  });
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function updateAxes(
  axes: Highcharts.Axis[] | undefined,
  nextOptions: Highcharts.XAxisOptions | Highcharts.XAxisOptions[] | Highcharts.YAxisOptions | Highcharts.YAxisOptions[] | undefined
) {
  const options = asArray(nextOptions);

  axes?.forEach((axis, index) => {
    const axisOptions = options[index];

    if (axisOptions) {
      axis.update(axisOptions as Highcharts.AxisOptions, false);
    }
  });
}

function updateSeriesData(chart: Highcharts.Chart, options: Highcharts.Options) {
  const nextSeries = asArray(options.series as Highcharts.SeriesOptionsType[] | undefined);

  if (!nextSeries.length || nextSeries.length !== chart.series.length) {
    return false;
  }

  for (let index = 0; index < nextSeries.length; index += 1) {
    const series = chart.series[index];
    const seriesOptions = nextSeries[index] as Highcharts.SeriesOptionsType & { data?: unknown[] };
    const nextType = 'type' in seriesOptions ? seriesOptions.type : undefined;

    if (nextType && series.type !== nextType) {
      return false;
    }

    if (!('data' in seriesOptions)) {
      return false;
    }
  }

  chart.setTitle(options.title, options.subtitle, false);
  updateAxes(chart.xAxis, options.xAxis);
  updateAxes(chart.yAxis, options.yAxis);
  updateAxes((chart as unknown as { colorAxis?: Highcharts.Axis[] }).colorAxis, options.colorAxis as Highcharts.YAxisOptions | Highcharts.YAxisOptions[] | undefined);

  nextSeries.forEach((seriesOptions, index) => {
    chart.series[index].setData(
      ((seriesOptions as Highcharts.SeriesOptionsType & { data?: unknown[] }).data || []) as never[],
      false,
      false,
      false
    );
  });

  chart.redraw(false);
  return true;
}

export const Chart = forwardRef<ChartHandle, ChartProps>(function Chart(
  {
    highcharts,
    options,
    constructorType = 'chart',
    onChartReady,
    allowChartUpdate = true,
    immutable = false,
    updateMode = 'options',
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
    () => {
      const handle = {} as ChartHandle;

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
      skipNextUpdateRef.current = false;
      return;
    }

    if (!allowChartUpdate) {
      return;
    }

    if (updateMode === 'series-data' && updateSeriesData(chart, options)) {
      sanitizeChartDom(chart);
      return;
    }

    chart.update(
      options,
      updateArgs[0],
      updateArgs[1],
      updateArgs[2] as boolean | Partial<Highcharts.AnimationOptionsObject>
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
