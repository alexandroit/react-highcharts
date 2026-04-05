# @revivejs/react-highcharts

> A maintained **React 18 wrapper for Highcharts** with a thin component API, imperative ref access, `stockChart` support, and versioned live demos.

[![npm version](https://img.shields.io/npm/v/@revivejs/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@revivejs/react-highcharts)
[![npm downloads](https://img.shields.io/npm/dt/@revivejs/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@revivejs/react-highcharts)
[![license](https://img.shields.io/npm/l/@revivejs/react-highcharts.svg?style=flat-square)](https://github.com/alexandroit/react-highcharts/blob/master/LICENSE)
[![React 18](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![Highcharts](https://img.shields.io/badge/Highcharts-12.5-navy?style=flat-square)](https://www.highcharts.com)

**[Documentation & Live Demos](https://alexandroit.github.io/react-highcharts/)** | **[npm](https://www.npmjs.com/package/@revivejs/react-highcharts)** | **[Issues](https://github.com/alexandroit/react-highcharts/issues)** | **[Repository](https://github.com/alexandroit/react-highcharts)**

**Latest version:** `18.0.0`

## Why this library?

`@revivejs/react-highcharts` is intentionally thin. It follows the common React + Highcharts pattern:

- pass a `highcharts` instance
- pass a single `options` object
- choose the constructor with `constructorType`
- access the live chart through a ref when you need imperative updates

That makes it easy to keep React in charge of composition while still using the full Highcharts API.

## React Version Compatibility

| Package version | React version | Highcharts version | Demo link |
| :---: | :---: | :---: | :--- |
| **18.0.0** | **18.3.x** | **12.5.x** | [React 18 demo](https://alexandroit.github.io/react-highcharts/react-18/) |
| **17.0.0** | **17.0.x** | **12.5.x** | [React 17 demo](https://alexandroit.github.io/react-highcharts/react-17/) |

## Installation

```bash
npm install @revivejs/react-highcharts highcharts
```

## Basic Usage

```tsx
import Highcharts from 'highcharts';
import { Chart } from '@revivejs/react-highcharts';

const options: Highcharts.Options = {
  title: { text: 'Quarterly revenue' },
  series: [
    {
      type: 'line',
      name: 'Revenue',
      data: [14, 18, 22, 28]
    }
  ]
};

export function RevenueChart() {
  return <Chart highcharts={Highcharts} options={options} />;
}
```

## StockChart

```tsx
import Highcharts from 'highcharts/highstock';
import { Chart } from '@revivejs/react-highcharts';

export function PriceChart() {
  return (
    <Chart
      highcharts={Highcharts}
      constructorType="stockChart"
      options={{
        series: [{ type: 'line', data: [101, 104, 109, 111] }]
      }}
    />
  );
}
```

## Modules

```tsx
import Highcharts from 'highcharts';
import {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules
} from '@revivejs/react-highcharts';

exposeHighchartsGlobals(Highcharts);

const [{ default: Highcharts3D }, { default: HeatmapModule }] = await Promise.all([
  import('highcharts/highcharts-3d.js'),
  import('highcharts/modules/heatmap.js')
]);

initHighchartsModules(Highcharts, Highcharts3D, HeatmapModule);
```

## Imperative Access

```tsx
import { useRef } from 'react';
import Highcharts from 'highcharts';
import { Chart, type ChartHandle } from '@revivejs/react-highcharts';

export function ControlledChart() {
  const chartRef = useRef<ChartHandle>(null);

  return (
    <>
      <button
        onClick={() => {
          chartRef.current?.chart?.series[0]?.addPoint(42);
        }}
      >
        Add point
      </button>
      <Chart ref={chartRef} highcharts={Highcharts} options={{ series: [{ type: 'line', data: [10, 12, 16] }] }} />
    </>
  );
}
```

## API

| Prop | Type | Notes |
| :--- | :--- | :--- |
| `highcharts` | `typeof Highcharts` | Required. Pass the instance or bundle you want to use. |
| `options` | `Highcharts.Options` | Required. Passed into the selected Highcharts constructor. |
| `constructorType` | `'chart' \| 'stockChart' \| 'mapChart' \| 'ganttChart'` | Defaults to `'chart'`. |
| `onChartReady` | `(chart) => void` | Called after the chart is created. |
| `allowChartUpdate` | `boolean` | Defaults to `true`. |
| `immutable` | `boolean` | Recreates the chart instead of calling `chart.update`. |
| `updateArgs` | `[redraw, oneToOne, animation]` | Forwarded to `chart.update`. |
| `containerProps` | `HTMLAttributes<HTMLDivElement>` | Additional props for the chart container. |

## Changelog

### 18.0.0
- Updated the library line for React 18.3
- Added the `react-18` demo app and made it the latest docs line
- Switched the demo bootstrap to `createRoot`

### 17.0.0
- Initial React wrapper line
- Added the first versioned docs app for React 17
- Established the versioned docs structure used by later releases
