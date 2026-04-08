# @stackline/react-highcharts

> A maintained **React 19 wrapper for Highcharts** with a thin component API, imperative ref access, `stockChart` support, and versioned live demos.

[![npm version](https://img.shields.io/npm/v/@stackline/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/react-highcharts)
[![npm downloads](https://img.shields.io/npm/dt/@stackline/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/react-highcharts)
[![license](https://img.shields.io/npm/l/@stackline/react-highcharts.svg?style=flat-square)](https://github.com/alexandroit/react-highcharts/blob/master/LICENSE)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Highcharts](https://img.shields.io/badge/Highcharts-12.5-navy?style=flat-square)](https://www.highcharts.com)

**[Documentation & Live Demos](https://alexandroit.github.io/react-highcharts/)** | **[npm](https://www.npmjs.com/package/@stackline/react-highcharts)** | **[Issues](https://github.com/alexandroit/react-highcharts/issues)** | **[Repository](https://github.com/alexandroit/react-highcharts)**

**Latest version:** `19.0.1`

## Why this library?

`@stackline/react-highcharts` is intentionally thin. It follows the common React + Highcharts pattern:

- pass a `highcharts` instance
- pass a single `options` object
- choose the constructor with `constructorType`
- access the live chart through a ref when you need imperative updates

That makes it easy to keep React in charge of composition while still using the full Highcharts API.

## React Version Compatibility

Each package family only installs on its matching React family. Framework major and package major are not always the same package number, so use the package family column below.

| Package family | Framework family | Peer range | Tested release window | Demo link |
| :---: | :---: | :---: | :---: | :--- |
| **19.x** | **React 19 only** | **`>=19.0.0 <20.0.0`** | **19.0.0 -> 19.2.5** | [React 19 family docs](https://alexandroit.github.io/react-highcharts/react-19/) |
| **18.x** | **React 18 only** | **`>=18.0.0 <19.0.0`** | **18.0.0 -> 18.3.1** | [React 18 family docs](https://alexandroit.github.io/react-highcharts/react-18/) |
| **17.x** | **React 17 only** | **`>=17.0.0 <18.0.0`** | **17.0.0 -> 17.0.2** | [React 17 family docs](https://alexandroit.github.io/react-highcharts/react-17/) |


## Installation

```bash
npm install @stackline/react-highcharts highcharts
```

Choose the package family from the compatibility table above. Each published family is locked to one framework major only.

## Basic Usage

```tsx
import Highcharts from 'highcharts';
import { Chart } from '@stackline/react-highcharts';

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
import { Chart } from '@stackline/react-highcharts';

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
} from '@stackline/react-highcharts';

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
import { Chart, type ChartHandle } from '@stackline/react-highcharts';

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

### 19.0.1
- Improved responsive chart behavior in the published wrapper by reflowing on container resize
- Updated the React 17, 18, and 19 docs so charts and the event log stack cleanly across mobile and desktop layouts

### 19.0.0
- Updated the library line for React 19.2
- Added the `react-19` demo app and made it the latest docs line
- Kept the wrapper API aligned with the React 17 and 18 lines

### 18.0.0
- Updated the library line for React 18.3
- Added the `react-18` demo app and made it the latest docs line
- Switched the demo bootstrap to `createRoot`

### 17.0.0
- Initial React wrapper line
- Added the first versioned docs app for React 17
- Established the versioned docs structure used by later releases
