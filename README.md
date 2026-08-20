# @stackline/react-highcharts

> A maintained React 19 wrapper for Highcharts, Highstock, and Highmaps applications, with standard chart rendering, constructor switching, module registration helpers, native chart instance access, resize-aware rendering, controlled update modes, and versioned live demos.

[![npm version](https://img.shields.io/npm/v/@stackline/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/react-highcharts)
[![npm monthly](https://img.shields.io/npm/dm/@stackline/react-highcharts.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/react-highcharts)
[![license](https://img.shields.io/npm/l/@stackline/react-highcharts.svg?style=flat-square)](https://github.com/alexandroit/react-highcharts/blob/main/LICENSE)
[![React 19](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react&logoColor=111111)](https://react.dev/)
[![Highcharts](https://img.shields.io/badge/Highcharts-6%2B-2f7ed8?style=flat-square)](https://www.highcharts.com/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation & Live Demos](https://alexandro.net/docs/react/react-highcharts/)** | **[React 19 Demo](https://alexandro.net/docs/react/react-highcharts/react-19/)** | **[npm](https://www.npmjs.com/package/@stackline/react-highcharts)** | **[Issues](https://github.com/alexandroit/react-highcharts/issues)** | **[Repository](https://github.com/alexandroit/react-highcharts)** | **[Community Discussions](https://www.reddit.com/r/Stackline/)**

<p align="center">
  <img src="https://assets.alexandro.net/2026/06/react-highcharts-live.png" alt="Stackline React Highcharts live examples" width="920">
</p>

**React 19 release:** `19.1.0`

---

> **Credits:** Stackline React Highcharts is maintained by [Alexandro Paixao Marques](https://github.com/alexandroit/react-highcharts). The package keeps the wrapper intentionally thin so React applications can use the native Highcharts API directly instead of learning a second chart abstraction.

---

## Why this library?

`@stackline/react-highcharts` gives React 19 applications a small, predictable bridge to Highcharts.

The goal is not to hide Highcharts. Your application still owns the real Highcharts options object, the Highcharts instance, module registration, constructor choice, event callbacks, and native chart instance. The wrapper gives React a stable `<Chart>` component, typed props, ref access, resize-aware rendering, SSR-safe effects, module helper utilities, and update modes that avoid unnecessary full chart recreation.

The React 19 package family is intended for React `19.x` applications. Release `19.1.0` is validated with React `19.2.8` and Highcharts `13.0.1`. The validation app renders static chart examples, realtime market examples, and verifies that dynamic charts update existing Highcharts series instead of blinking through full object recreation.

## Features

| Feature | Supported |
| :--- | :---: |
| React 19 tested release line | ✅ |
| Highcharts 13 tested release line | ✅ |
| Standard `Highcharts.Chart` rendering | ✅ |
| `stockChart` constructor support | ✅ |
| `mapChart` and `ganttChart` constructor names | ✅ |
| Native Highcharts options object | ✅ |
| Native chart instance access through React refs | ✅ |
| `onChartReady` callback | ✅ |
| Highcharts module registration helpers | ✅ |
| Duplicate module registration guard | ✅ |
| ResizeObserver reflow support | ✅ |
| Window resize reflow fallback | ✅ |
| Controlled `chart.update(...)` arguments | ✅ |
| Immutable recreation mode | ✅ |
| Series-data update mode for realtime charts | ✅ |
| Option callbacks stay native Highcharts callbacks | ✅ |
| Static examples for common chart types | ✅ |
| Realtime chart demo coverage | ✅ |
| Versioned docs builds per React line | ✅ |

## Table of Contents

1. [React Version Compatibility](#react-version-compatibility)
2. [Installation](#installation)
3. [Highcharts Compatibility](#highcharts-compatibility)
4. [Setup](#setup)
5. [Basic Usage](#basic-usage)
6. [Constructor Switch](#constructor-switch)
7. [Highcharts Modules](#highcharts-modules)
8. [Events](#events)
9. [Native Chart Instance](#native-chart-instance)
10. [Dynamic Updates](#dynamic-updates)
11. [Common Chart Types](#common-chart-types)
12. [API Surface](#api-surface)
13. [Wrapper Capabilities](#wrapper-capabilities)
14. [License](#license)

## React Version Compatibility

Each package family targets one React major. Keep the package major aligned with the React major used by your application.

| Package family | React family | Peer range | Install |
| :---: | :---: | :---: | :--- |
| `19.x` | React `19.x` | `>=19.0.0 <20.0.0` | `npm install @stackline/react-highcharts@19.1.0 highcharts@13.0.1 --save-exact` |
| `18.x` | React `18.x` | `>=18.0.0 <19.0.0` | `npm install @stackline/react-highcharts@18.0.0 highcharts@12.6.0 --save-exact` |
| `17.x` | React `17.x` | `>=17.0.0 <18.0.0` | `npm install @stackline/react-highcharts@17.0.0 highcharts@12.6.0 --save-exact` |

Each React major is released separately so every line can be tested with the matching React runtime and project template.

## Installation

```bash
npm install @stackline/react-highcharts highcharts
```

The package declares `highcharts`, `react`, and `react-dom` as peer dependencies so your application owns the Highcharts build, modules, license, and React runtime.

Use `npm install @stackline/react-highcharts@19.1.0 highcharts@13.0.1 --save-exact` when your release process pins exact dependency versions.

## Highcharts Compatibility

The React 19 validation app uses `highcharts@13.0.1`, which is the highest Highcharts version tested for this line.

The maintained Stackline React 19 line is published with a Highcharts peer range of `>=6.0.0 <=13.0.1` so applications get a clear compatibility ceiling while still keeping Highcharts as an application-owned peer dependency.

Highcharts 6 predates bundled TypeScript declarations. JavaScript applications can use it directly; TypeScript applications pinned to Highcharts 6 must also install the historical `@types/highcharts@5.0.44` declarations. Highcharts 7 and newer include their own declarations.

Highcharts 13 moved data sorting into a separate module. Applications that use `plotOptions.series.dataSorting` should register it during startup:

```tsx
const dataSortingModule = await import('highcharts/modules/data-sorting.js');
initHighchartsModules(Highcharts, dataSortingModule);
```

## Setup

### 1. Import Highcharts and the wrapper

```tsx
import Highcharts from 'highcharts';
import { Chart } from '@stackline/react-highcharts';
```

### 2. Render the wrapper with native Highcharts options

```tsx
<Chart highcharts={Highcharts} options={options} />
```

## Basic Usage

### 1. Render a chart

```tsx
import Highcharts from 'highcharts';
import { Chart } from '@stackline/react-highcharts';

const options: Highcharts.Options = {
  chart: { type: 'line' },
  title: { text: 'Simple chart' },
  xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'] },
  yAxis: { title: { text: 'Revenue' } },
  series: [
    { type: 'line', name: 'Orders', data: [29.9, 71.5, 106.4, 129.2] }
  ]
};

export function RevenueChart() {
  return <Chart highcharts={Highcharts} options={options} />;
}
```

## Constructor Switch

Use `constructorType` when the chart should be created with another Highcharts constructor.

```tsx
import Highcharts from 'highcharts/highstock';
import { Chart } from '@stackline/react-highcharts';

const stockOptions: Highcharts.Options = {
  rangeSelector: { selected: 1 },
  title: { text: 'BNBUSDT candles' },
  series: [
    {
      type: 'candlestick',
      name: 'BNBUSDT',
      data: []
    }
  ]
};

export function CandleChart() {
  return (
    <Chart
      highcharts={Highcharts}
      constructorType="stockChart"
      options={stockOptions}
    />
  );
}
```

Common constructor values:

| Constructor | Usage |
| :--- | :--- |
| `chart` | Default Highcharts charts. |
| `stockChart` | Highstock timelines, candlesticks, ranges, and financial charts. |
| `mapChart` | Highmaps-style charts when the matching Highcharts build is registered. |
| `ganttChart` | Gantt-style charts when the matching Highcharts build is registered. |

## Highcharts Modules

Register Highcharts modules once at application startup. The helper accepts both direct module factories and ESM default exports.

```tsx
import Highcharts from 'highcharts/highstock';
import {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules
} from '@stackline/react-highcharts';

exposeHighchartsGlobals(Highcharts);

const [moreModule, heatmapModule, treemapModule, solidGaugeModule] = await Promise.all([
  import('highcharts/highcharts-more.js'),
  import('highcharts/modules/heatmap.js'),
  import('highcharts/modules/treemap.js'),
  import('highcharts/modules/solid-gauge.js')
]);

initHighchartsModules(
  Highcharts,
  moreModule,
  heatmapModule,
  treemapModule,
  solidGaugeModule
);
```

The live test matrix covers examples for line, spline, area, areaspline, column, bar, stacked column, pie, donut, scatter, bubble, combination, polar, gauge, solid gauge, heatmap, treemap, funnel, 3D column, StockChart, map-like charts, renko, point-and-figure, and no-data states.

## Events

Highcharts event callbacks stay inside the native options object, so existing Highcharts knowledge transfers directly.

```tsx
const options: Highcharts.Options = {
  chart: {
    zoomType: 'xy',
    events: {
      selection(event) {
        console.log('selection', event.xAxis?.[0]);
      }
    }
  },
  plotOptions: {
    series: {
      allowPointSelect: true,
      events: {
        mouseOver() {
          console.log('series hover', this.name);
        }
      },
      point: {
        events: {
          select() {
            console.log('point selected', this.category, this.y);
          }
        }
      }
    }
  },
  series: [{ type: 'column', name: 'Visits', data: [13, 18, 42, 68] }]
};
```

## Native Chart Instance

Use a React ref when your application needs the real `Highcharts.Chart` instance.

```tsx
import { useRef } from 'react';
import Highcharts from 'highcharts';
import { Chart, type ChartHandle } from '@stackline/react-highcharts';

export function ImperativeChart() {
  const chartRef = useRef<ChartHandle>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => chartRef.current?.chart?.series[0]?.addPoint(42)}
      >
        Add point
      </button>

      <Chart
        ref={chartRef}
        highcharts={Highcharts}
        options={{
          title: { text: 'Native instance access' },
          series: [{ type: 'spline', data: [2, 3, 5, 8, 13] }]
        }}
      />
    </>
  );
}
```

## Dynamic Updates

By default, the wrapper calls `chart.update(options, ...updateArgs)` when the options prop changes.

For realtime data feeds, `updateMode="series-data"` updates existing series data when the chart shape is stable. This avoids full object recreation and reduces visual blinking in live charts.

```tsx
<Chart
  highcharts={Highcharts}
  options={liveOptions}
  updateMode="series-data"
  updateArgs={[true, true, false]}
/>
```

Use `immutable` when you intentionally want a full chart recreation:

```tsx
<Chart highcharts={Highcharts} options={options} immutable />
```

Use `allowChartUpdate={false}` when a chart should be created once and then controlled manually through the native chart instance:

```tsx
<Chart
  ref={chartRef}
  highcharts={Highcharts}
  options={snapshotOptions}
  allowChartUpdate={false}
/>
```

## Common Chart Types

The wrapper does not limit chart types. If Highcharts supports it and the required module is registered, pass the native options object.

| Chart family | Examples |
| :--- | :--- |
| Core charts | line, spline, area, areaspline, column, bar, pie, donut |
| Analytics charts | scatter, bubble, heatmap, treemap, funnel, solid gauge |
| Financial charts | StockChart, candlestick, HLC, OHLC, renko, point-and-figure |
| Advanced modules | 3D column, packed bubble, dependency wheel, network graph, sunburst |
| Map-like modules | map-style charts when the matching Highcharts map build is registered |

## API Surface

| Prop | Type | Notes |
| :--- | :--- | :--- |
| `highcharts` | `typeof Highcharts` | Required. Pass the Highcharts instance or bundle your application wants to use. |
| `options` | `Highcharts.Options` | Required. Passed into the selected Highcharts constructor. |
| `constructorType` | `'chart' \| 'stockChart' \| 'mapChart' \| 'ganttChart'` | Defaults to `'chart'`. |
| `onChartReady` | `(chart: Highcharts.Chart) => void` | Called after the chart is created. |
| `allowChartUpdate` | `boolean` | Defaults to `true`. Set to `false` for manual native updates. |
| `immutable` | `boolean` | Recreates the chart instead of calling `chart.update(...)`. |
| `updateMode` | `'options' \| 'series-data'` | Defaults to `'options'`. Use `'series-data'` for stable realtime series. |
| `updateArgs` | `[redraw, oneToOne, animation]` | Forwarded to `chart.update(...)` in options mode. |
| `containerProps` | `React.HTMLAttributes<HTMLDivElement>` | Props and styles for the chart container. |

| Export | Type | Notes |
| :--- | :--- | :--- |
| `Chart` | React component | Main wrapper component. |
| `ChartHandle` | Type | Ref shape with `chart` and `container`. |
| `ChartProps` | Type | Component prop type. |
| `ConstructorType` | Type | Supported constructor string union. |
| `exposeHighchartsGlobals` | Function | Assigns `Highcharts` and `_Highcharts` on `globalThis` for modules that expect globals. |
| `initHighchartsModules` | Function | Applies Highcharts modules once per Highcharts instance. |
| `HighchartsModuleFactory` | Type | Accepted module factory shape. |

## Wrapper Capabilities

| Capability | API |
| :--- | :--- |
| Options API | `<Chart highcharts={Highcharts} options={options} />` |
| Constructor switch | `constructorType="stockChart"` |
| Native ref access | `chartRef.current?.chart` |
| Controlled updates | `allowChartUpdate`, `immutable`, `updateArgs` |
| Realtime series updates | `updateMode="series-data"` |
| Module registration | `initHighchartsModules(Highcharts, ...modules)` |
| Module globals | `exposeHighchartsGlobals(Highcharts)` |
| Responsive reflow | `ResizeObserver` plus window resize fallback |

## Changelog

### 19.1.0

- Validated React 19.2.8, React DOM 19.2.8, and Highcharts 13.0.1 without changing the wrapper API.
- Fixed imperative refs so `chart` and `container` always expose the live instances.
- Fixed consecutive `immutable` updates so every requested recreation is applied.
- Added lifecycle, module, package, browser, and audit release contracts.
- Updated the React 19 demo to Vite 8.2.1 and explicit Highcharts 13 data-sorting registration.

### 19.0.0

- Added the maintained React 19 package line with React 19.2.7 validation.
- Kept Highcharts 12.6.0 as the tested compatibility ceiling for this line.
- Reused the corrected modern live matrix from the React 18 release: realtime charts, static chart families, module-heavy examples, and stable live updates without blinking.
- Kept README media on the public Stackline assets host.

### 18.0.0

- Added the maintained React 18 package line with React 18.3.1 validation.
- Kept Highcharts 12.6.0 as the tested compatibility ceiling for this line.
- Reused the corrected modern live matrix from the React 17 release: realtime charts, static chart families, module-heavy examples, and no blink/recreate behavior for stable live updates.
- Updated the README image to the public Stackline assets host.

### 17.0.0

- Updated the library line for React 17.0.2.
- Added the React 17 live app with full Highcharts example coverage.
- Aligned the React live template with the Angular 21 Highcharts documentation style.
- Updated the demo to use Highcharts 12.6.0 with the latest stable compatible module set.
- Improved responsive chart behavior by reflowing on container resize.
- Added `updateMode="series-data"` for live charts that should update existing series instead of recreating the chart.
- Added a small chart DOM sanitizer for invalid SVG `visibility="NaN"` output from derived Highcharts modules.

## License

The React wrapper in this repository is released under the [MIT License](LICENSE).

Highcharts is a separate peer dependency and is not distributed under this repository's MIT license. Review the [Highcharts licensing terms](https://www.highcharts.com/license) for your application.
