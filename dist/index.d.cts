import * as react from 'react';
import { HTMLAttributes } from 'react';
import Highcharts from 'highcharts';

type ConstructorType = 'chart' | 'stockChart' | 'mapChart' | 'ganttChart';
interface ChartHandle {
    chart: Highcharts.Chart | null;
    container: HTMLDivElement | null;
}
interface ChartProps {
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
declare const Chart: react.ForwardRefExoticComponent<ChartProps & react.RefAttributes<ChartHandle>>;

type HighchartsModuleFactory = ((highcharts: typeof Highcharts) => void) | {
    default?: (highcharts: typeof Highcharts) => void;
};
declare function exposeHighchartsGlobals(highcharts: typeof Highcharts): void;
declare function initHighchartsModules(highcharts: typeof Highcharts, ...modules: HighchartsModuleFactory[]): void;

export { Chart, type ChartHandle, type ChartProps, type ConstructorType, type HighchartsModuleFactory, exposeHighchartsGlobals, initHighchartsModules };
