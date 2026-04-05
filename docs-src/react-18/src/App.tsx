import { useEffect, useRef, useState, type ReactNode } from 'react';
import Highcharts from 'highcharts/highstock';
import {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules,
  type ChartHandle
} from '@revivejs/react-highcharts';

Highcharts.setOptions({
  colors: ['#0d5c9e', '#30a46c', '#d26a2a', '#b43f3f', '#6d52b5']
});

const INSTALL_CODE = `npm install @revivejs/react-highcharts highcharts`;

const SETUP_CODE = `import Highcharts from 'highcharts';\nimport { Chart } from '@revivejs/react-highcharts';\n\n<Chart highcharts={Highcharts} options={myOptions} />`;

const STOCK_CODE = `import Highstock from 'highcharts/highstock';\n\n<Chart\n  highcharts={Highstock}\n  constructorType="stockChart"\n  options={stockOptions}\n/>`;

const OPTIONAL_MODULE_LOADERS = [
  { name: 'highcharts/highcharts-3d.js', load: () => import('highcharts/highcharts-3d.js') },
  { name: 'highcharts/modules/heatmap.js', load: () => import('highcharts/modules/heatmap.js') },
  { name: 'highcharts/modules/bullet.js', load: () => import('highcharts/modules/bullet.js') },
  { name: 'highcharts/modules/xrange.js', load: () => import('highcharts/modules/xrange.js') },
  { name: 'highcharts/modules/sankey.js', load: () => import('highcharts/modules/sankey.js') },
  { name: 'highcharts/modules/organization.js', load: () => import('highcharts/modules/organization.js') },
  { name: 'highcharts/modules/dependency-wheel.js', load: () => import('highcharts/modules/dependency-wheel.js') },
  { name: 'highcharts/modules/venn.js', load: () => import('highcharts/modules/venn.js') },
  { name: 'highcharts/modules/timeline.js', load: () => import('highcharts/modules/timeline.js') },
  { name: 'highcharts/modules/marker-clusters.js', load: () => import('highcharts/modules/marker-clusters.js') },
  { name: 'highcharts/modules/annotations.js', load: () => import('highcharts/modules/annotations.js') },
  { name: 'highcharts/modules/drilldown.js', load: () => import('highcharts/modules/drilldown.js') },
  { name: 'highcharts/modules/arc-diagram.js', load: () => import('highcharts/modules/arc-diagram.js') },
  { name: 'highcharts/modules/treemap.js', load: () => import('highcharts/modules/treemap.js') },
  { name: 'highcharts/modules/treegraph.js', load: () => import('highcharts/modules/treegraph.js') },
  { name: 'highcharts/modules/pointandfigure.js', load: () => import('highcharts/modules/pointandfigure.js') },
  { name: 'highcharts/modules/renko.js', load: () => import('highcharts/modules/renko.js') }
] as const;

const MODULE_CODE = `import Highcharts from 'highcharts/highstock';\nimport {\n  exposeHighchartsGlobals,\n  initHighchartsModules\n} from '@revivejs/react-highcharts';\n\nconst moduleLoaders = [\n  () => import('highcharts/highcharts-3d.js'),\n  () => import('highcharts/modules/heatmap.js'),\n  () => import('highcharts/modules/bullet.js'),\n  () => import('highcharts/modules/xrange.js'),\n  () => import('highcharts/modules/sankey.js'),\n  () => import('highcharts/modules/organization.js'),\n  () => import('highcharts/modules/dependency-wheel.js'),\n  () => import('highcharts/modules/venn.js'),\n  () => import('highcharts/modules/timeline.js'),\n  () => import('highcharts/modules/marker-clusters.js'),\n  () => import('highcharts/modules/annotations.js'),\n  () => import('highcharts/modules/drilldown.js'),\n  () => import('highcharts/modules/arc-diagram.js'),\n  () => import('highcharts/modules/treemap.js'),\n  () => import('highcharts/modules/treegraph.js'),\n  () => import('highcharts/modules/pointandfigure.js'),\n  () => import('highcharts/modules/renko.js')\n];\n\nexposeHighchartsGlobals(Highcharts);\n\nconst modules = [];\nfor (const load of moduleLoaders) {\n  modules.push(await load());\n}\n\ninitHighchartsModules(Highcharts, ...modules);`;

const EVENT_CODE = `const eventChartRef = useRef<ChartHandle>(null);\n\nconst eventOptions = {\n  chart: {\n    zoomType: 'xy',\n    events: {\n      selection(event) {\n        const axis = event.xAxis?.[0];\n        if (axis) {\n          pushLog(\`Selection: \${axis.min?.toFixed(2)} to \${axis.max?.toFixed(2)}\`);\n        }\n      }\n    }\n  },\n  xAxis: {\n    events: {\n      afterSetExtremes(event) {\n        pushLog(\`X extremes: \${event.min} to \${event.max}\`);\n      }\n    }\n  }\n};`;

const IMPERATIVE_CODE = `const chartRef = useRef<ChartHandle>(null);\n\nchartRef.current?.chart?.series[0]?.addPoint(28);\nchartRef.current?.chart?.setTitle({ text: 'Updated at 14:12:03' });`;

type AppProps = {
  reactLine: string;
};

type DemoCardProps = {
  title: string;
  description: string;
  codes?: string[];
  controls?: ReactNode;
  note?: ReactNode;
  full?: boolean;
  children: ReactNode;
};

function stamp(message: string) {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}  ${message}`;
}

function simpleChartCode(name: string) {
  return `<Chart highcharts={Highcharts} options={${name}} />`;
}

function simpleStockCode(name: string) {
  return `<Chart highcharts={Highcharts} constructorType="stockChart" options={${name}} />`;
}

function generateTimeSeries() {
  const points: Array<[number, number]> = [];
  let value = 96;
  const start = Date.UTC(2024, 0, 1);

  for (let index = 0; index < 90; index += 1) {
    value += Math.sin(index / 7) * 1.8 + (index % 5 === 0 ? 2.2 : -0.4);
    points.push([start + index * 86400000, Math.round(value * 100) / 100]);
  }

  return points;
}

function logExtremes(axis: string, ctx: any, log: (message: string) => void) {
  if (typeof ctx.min === 'number' && typeof ctx.max === 'number') {
    log(`${axis} extremes: ${ctx.min.toFixed(2)} to ${ctx.max.toFixed(2)}`);
  }
}

function makeBasicOptions() {
  return {
    title: { text: 'Basic chart' },
    subtitle: { text: 'Minimal usage through the options prop.' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: 'Score' } },
    series: [
      { name: 'Alpha', type: 'line', data: [29.9, 41.2, 51.8, 63.4, 72.1, 84.6] },
      { name: 'Beta', type: 'line', data: [18.2, 24.5, 39.1, 44.4, 60.3, 67.9] }
    ]
  } as any;
}

function makeStockOptions() {
  return {
    rangeSelector: { selected: 1 },
    title: { text: 'StockChart — time series' },
    series: [{
      name: 'Asset',
      type: 'line',
      data: generateTimeSeries(),
      tooltip: { valueDecimals: 2 }
    }]
  } as any;
}

function makeEventOptions(log: (message: string) => void) {
  return {
    chart: {
      zoomType: 'xy',
      events: {
        selection(event: any) {
          const axis = event.xAxis && event.xAxis.length ? event.xAxis[0] : null;
          if (axis) {
            log(`Selection: ${axis.min.toFixed(2)} to ${axis.max.toFixed(2)}`);
          }
        }
      }
    },
    title: { text: 'Options-driven event bridge' },
    subtitle: { text: 'Drag to select, hover a series, or click a point' },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      events: {
        afterSetExtremes(event: any) {
          logExtremes('X', event, log);
        }
      }
    },
    yAxis: {
      title: { text: 'Visits' },
      events: {
        afterSetExtremes(event: any) {
          logExtremes('Y', event, log);
        }
      }
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        events: {
          mouseOver(this: any) {
            log(`Series hover: ${this.name}`);
          }
        },
        point: {
          events: {
            select(this: any) {
              log(`Point selected: ${this.category} = ${this.y}`);
            }
          }
        }
      }
    },
    series: [{
      name: 'Visits',
      type: 'column',
      data: [13, 18, 42, 68, 81, 55, 39]
    }]
  } as any;
}

function makeDynamicOptions() {
  return {
    title: { text: 'Native instance access' },
    subtitle: { text: 'Use the wrapper ref to capture the Highcharts object' },
    series: [{ type: 'spline', data: [2, 3, 5, 8, 13, 21] }]
  } as any;
}

function makeZAxisOptions(log: (message: string) => void) {
  return {
    chart: {
      type: 'scatter',
      margin: 70,
      options3d: { enabled: true, alpha: 10, beta: 28, depth: 280, viewDistance: 5 },
      events: {
        load() {
          log('z-axis chart ready.');
        }
      }
    },
    title: { text: 'zAxis in plain options' },
    subtitle: { text: 'The wrapper stays thin while 3D axes remain fully available.' },
    xAxis: { min: 0, max: 10 },
    yAxis: { min: 0, max: 10 },
    zAxis: {
      min: 0,
      max: 10,
      title: { text: 'Depth' },
      events: {
        afterSetExtremes(event: any) {
          logExtremes('Z', event, log);
        }
      }
    },
    plotOptions: {
      scatter: {
        width: 10,
        height: 10,
        depth: 10
      }
    },
    series: [{
      name: '3D points',
      type: 'scatter',
      data: [[1, 6, 2], [2, 4, 5], [3, 8, 3], [5, 3, 7], [7, 2, 9], [8, 7, 6], [9, 5, 1]]
    }]
  } as any;
}

function makeColorAxisOptions(log: (message: string) => void) {
  return {
    chart: {
      type: 'heatmap',
      events: {
        load() {
          log('color-axis chart ready.');
        }
      }
    },
    title: { text: 'colorAxis in plain options' },
    subtitle: { text: 'Heatmaps keep their native color axis API.' },
    xAxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    yAxis: { categories: ['Morning', 'Noon', 'Evening', 'Night'], title: null },
    colorAxis: {
      min: 0,
      minColor: '#f3f7fb',
      maxColor: '#1f5ba7',
      events: {
        afterSetExtremes(event: any) {
          logExtremes('Color', event, log);
        }
      }
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      margin: 0,
      verticalAlign: 'top',
      y: 25,
      symbolHeight: 200
    },
    series: [{
      borderWidth: 1,
      type: 'heatmap',
      data: [
        [0, 0, 2], [1, 0, 4], [2, 0, 5], [3, 0, 7], [4, 0, 8],
        [0, 1, 1], [1, 1, 3], [2, 1, 6], [3, 1, 8], [4, 1, 9],
        [0, 2, 0], [1, 2, 2], [2, 2, 5], [3, 2, 7], [4, 2, 6],
        [0, 3, 1], [1, 3, 2], [2, 3, 4], [3, 3, 5], [4, 3, 7]
      ]
    }]
  } as any;
}

function makeModuleOptions(enabled: boolean) {
  return {
    title: { text: enabled ? '3D column — module active' : '2D column — module inactive' },
    subtitle: { text: 'Reassign the options object to update React state and redraw the chart.' },
    chart: {
      type: 'column',
      margin: 70,
      options3d: { enabled, alpha: 12, beta: 18, depth: 48 }
    },
    plotOptions: {
      column: {
        depth: enabled ? 24 : 0
      }
    },
    xAxis: { categories: ['North', 'South', 'East', 'West'] },
    series: [{ name: 'Orders', type: 'column', data: [29.9, 71.5, 46.4, 58.2] }]
  } as any;
}

function makeBulletOptions() {
  return {
    chart: { type: 'bullet', inverted: true, marginLeft: 135 },
    title: { text: 'Bullet chart — Highcharts 6' },
    subtitle: { text: 'Actual vs target vs qualitative ranges.' },
    legend: { enabled: false },
    xAxis: {
      categories: ['Revenue', 'Profit', 'Customer sat.', 'New accounts']
    },
    yAxis: {
      gridLineWidth: 0,
      plotBands: [
        { from: 0, to: 150, color: '#d9eaf7' },
        { from: 150, to: 225, color: '#b8d4ed' },
        { from: 225, to: 300, color: '#7fb0db' }
      ],
      title: null
    },
    plotOptions: {
      series: {
        pointPadding: 0.25,
        borderWidth: 0,
        targetOptions: { width: '200%' }
      }
    },
    series: [{
      type: 'bullet',
      data: [
        { y: 194, target: 200 },
        { y: 83, target: 75 },
        { y: 72, target: 68 },
        { y: 31, target: 40 }
      ]
    }]
  } as any;
}

function makeXRangeOptions() {
  return {
    chart: { type: 'xrange' },
    title: { text: 'X-Range chart — Highcharts 6' },
    subtitle: { text: 'Horizontal bars spanning a date range on the X axis.' },
    xAxis: {
      type: 'datetime',
      min: Date.UTC(2024, 10, 20),
      max: Date.UTC(2024, 11, 31)
    },
    yAxis: {
      title: { text: '' },
      categories: ['Design', 'Development', 'Testing', 'Deployment'],
      reversed: true
    },
    series: [{
      name: 'Project plan',
      type: 'xrange',
      pointWidth: 20,
      data: [
        { x: Date.UTC(2024, 10, 21), x2: Date.UTC(2024, 10, 28), y: 0 },
        { x: Date.UTC(2024, 10, 25), x2: Date.UTC(2024, 11, 10), y: 1 },
        { x: Date.UTC(2024, 11, 8), x2: Date.UTC(2024, 11, 18), y: 2 },
        { x: Date.UTC(2024, 11, 16), x2: Date.UTC(2024, 11, 24), y: 3 }
      ]
    }]
  } as any;
}

function makeTimelineOptions() {
  return {
    chart: { type: 'timeline' },
    title: { text: 'Timeline chart — Highcharts 7' },
    subtitle: { text: 'Chronological milestones using the timeline module.' },
    xAxis: { visible: false },
    yAxis: { visible: false },
    legend: { enabled: false },
    series: [{
      type: 'timeline',
      data: [
        { x: Date.UTC(2024, 0, 15), name: 'Discovery', label: 'Research and concept approval' },
        { x: Date.UTC(2024, 1, 12), name: 'Prototype', label: 'Interactive prototype reviewed' },
        { x: Date.UTC(2024, 2, 18), name: 'Launch', label: 'Feature released to customers' },
        { x: Date.UTC(2024, 3, 9), name: 'Scale', label: 'Second rollout phase started' }
      ]
    }]
  } as any;
}

function makeVennOptions() {
  return {
    title: { text: 'Venn diagram — Highcharts 7' },
    subtitle: { text: 'Overlap between product capabilities.' },
    series: [{
      type: 'venn',
      data: [
        { sets: ['React'], value: 8 },
        { sets: ['Highcharts'], value: 8 },
        { sets: ['TypeScript'], value: 7 },
        { sets: ['React', 'Highcharts'], value: 4 },
        { sets: ['React', 'TypeScript'], value: 5 },
        { sets: ['Highcharts', 'TypeScript'], value: 3 },
        { sets: ['React', 'Highcharts', 'TypeScript'], value: 2 }
      ]
    }]
  } as any;
}

function makeOrganizationOptions() {
  return {
    title: { text: 'Organization chart — Highcharts 7' },
    subtitle: { text: 'Hierarchical relationships built on the sankey engine.' },
    series: [{
      type: 'organization',
      name: 'Delivery team',
      keys: ['from', 'to'],
      data: [
        ['Project lead', 'Product owner'],
        ['Project lead', 'Engineering lead'],
        ['Engineering lead', 'Frontend engineer'],
        ['Engineering lead', 'Backend engineer'],
        ['Product owner', 'UX designer']
      ],
      nodes: [
        { id: 'Project lead', title: 'Lead', name: 'Morgan Lee' },
        { id: 'Product owner', title: 'Product', name: 'Riley Chen' },
        { id: 'Engineering lead', title: 'Engineering', name: 'Jordan Patel' },
        { id: 'Frontend engineer', title: 'Frontend', name: 'Taylor Kim' },
        { id: 'Backend engineer', title: 'Backend', name: 'Avery Cruz' },
        { id: 'UX designer', title: 'Design', name: 'Quinn Brooks' }
      ],
      colorByPoint: false,
      color: '#4f8fba',
      borderColor: '#1f5ba7',
      dataLabels: {
        color: '#ffffff'
      }
    }]
  } as any;
}

function makeDependencyWheelOptions() {
  return {
    title: { text: 'Dependency wheel — Highcharts 7' },
    subtitle: { text: 'Flow relationships between application layers.' },
    series: [{
      type: 'dependencywheel',
      name: 'Dependencies',
      keys: ['from', 'to', 'weight'],
      data: [
        ['UI', 'API', 3],
        ['API', 'Database', 5],
        ['API', 'Auth', 2],
        ['Auth', 'Database', 1],
        ['Workers', 'API', 2],
        ['Workers', 'Database', 2]
      ],
      dataLabels: {
        color: '#102033'
      }
    }]
  } as any;
}

function makeRadialBarOptions() {
  return {
    chart: { polar: true, inverted: true, type: 'column' },
    title: { text: 'Radial bar chart — Highcharts 8' },
    subtitle: { text: 'A radial presentation built with an inverted polar column chart.' },
    pane: { endAngle: 270, size: '85%', innerSize: '25%' },
    legend: { enabled: false },
    xAxis: {
      categories: ['Availability', 'Throughput', 'Quality', 'Automation'],
      lineWidth: 0,
      tickLength: 0
    },
    yAxis: {
      min: 0,
      max: 100,
      gridLineInterpolation: 'polygon',
      title: { text: '' }
    },
    plotOptions: {
      column: {
        pointPadding: 0.04,
        groupPadding: 0.05
      }
    },
    series: [{
      type: 'column',
      name: 'Score',
      data: [88, 74, 93, 67]
    }]
  } as any;
}

function makeSortedBarOptions() {
  return {
    chart: { type: 'bar' },
    title: { text: 'Data sorting — Highcharts 8' },
    subtitle: { text: 'Series can sort category points automatically while preserving animation.' },
    xAxis: { type: 'category' },
    yAxis: { title: { text: 'Story points closed' } },
    legend: { enabled: false },
    series: [{
      type: 'bar',
      name: 'Completed',
      dataSorting: { enabled: true },
      data: [
        { name: 'Search', y: 12 },
        { name: 'Checkout', y: 31 },
        { name: 'Analytics', y: 18 },
        { name: 'Accounts', y: 26 },
        { name: 'Notifications', y: 9 }
      ]
    }]
  } as any;
}

function makeMarkerClusterOptions() {
  const data: Array<[number, number]> = [];

  for (let index = 0; index < 120; index += 1) {
    const x = (index % 12) * 8 + (index % 3);
    const y = Math.floor(index / 12) * 7 + (index % 5);
    data.push([x, y]);
  }

  return {
    chart: { type: 'scatter', zoomType: 'xy' },
    title: { text: 'Marker clusters — Highcharts 8' },
    subtitle: { text: 'Scatter points can be grouped visually with the marker-clusters module.' },
    xAxis: { title: { text: 'Longitude bucket' } },
    yAxis: { title: { text: 'Latitude bucket' } },
    legend: { enabled: false },
    plotOptions: {
      scatter: {
        cluster: {
          enabled: true,
          allowOverlap: false,
          layoutAlgorithm: {
            type: 'grid',
            gridSize: 40
          }
        }
      }
    },
    series: [{
      type: 'scatter',
      name: 'Events',
      data
    }]
  } as any;
}

function makeArea3dOptions() {
  return {
    chart: {
      type: 'area',
      margin: 70,
      options3d: { enabled: true, alpha: 18, beta: 28, depth: 120, viewDistance: 24 }
    },
    title: { text: '3D area chart — Highcharts 9' },
    subtitle: { text: 'Area series can render inside 3D charts.' },
    xAxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: { title: { text: 'Adoption score' } },
    plotOptions: {
      area: {
        depth: 36,
        marker: { enabled: false }
      }
    },
    series: [
      { type: 'area', name: 'Platform', data: [34, 52, 71, 86] },
      { type: 'area', name: 'API', data: [22, 38, 56, 74] }
    ]
  } as any;
}

function makeTouchZoomOptions() {
  return {
    chart: {
      zoomType: 'x',
      zoomBySingleTouch: true
    },
    title: { text: 'Single-touch zoom — Highcharts 9' },
    subtitle: { text: 'Touch users can zoom with one finger instead of a two-finger gesture.' },
    xAxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8']
    },
    yAxis: { title: { text: 'Requests per minute' } },
    series: [{
      type: 'line',
      name: 'Traffic',
      data: [14, 18, 27, 33, 45, 42, 55, 61]
    }]
  } as any;
}

function makeHlcOptions() {
  return {
    rangeSelector: { selected: 1 },
    title: { text: 'HLC series — Highcharts 9' },
    subtitle: { text: 'The Highstock bundle includes the hlc series type.' },
    yAxis: { title: { text: 'Price' } },
    series: [{
      type: 'hlc',
      name: 'Service index',
      data: [
        [Date.UTC(2024, 0, 2), 128, 119, 124],
        [Date.UTC(2024, 0, 3), 131, 121, 127],
        [Date.UTC(2024, 0, 4), 133, 125, 129],
        [Date.UTC(2024, 0, 5), 136, 127, 130],
        [Date.UTC(2024, 0, 8), 134, 126, 132],
        [Date.UTC(2024, 0, 9), 138, 129, 136],
        [Date.UTC(2024, 0, 10), 141, 133, 138],
        [Date.UTC(2024, 0, 11), 143, 136, 140]
      ],
      tooltip: { valueDecimals: 2 }
    }]
  } as any;
}

function makeNodeOffsetsOptions() {
  return {
    title: { text: 'Node offsets — Highcharts 9' },
    subtitle: { text: 'Organization chart nodes can be nudged with offsetHorizontal and offsetVertical.' },
    series: [{
      type: 'organization',
      name: 'Delivery pod',
      keys: ['from', 'to'],
      data: [
        ['Platform lead', 'Product ops'],
        ['Platform lead', 'Frontend'],
        ['Platform lead', 'Backend'],
        ['Platform lead', 'Data'],
        ['Product ops', 'Research']
      ],
      nodes: [
        { id: 'Platform lead', title: 'Lead', name: 'Jordan Hale' },
        { id: 'Product ops', title: 'Ops', name: 'Sam Rivera', offsetHorizontal: 26 },
        { id: 'Frontend', title: 'Frontend', name: 'Alex Morgan', offsetVertical: -18 },
        { id: 'Backend', title: 'Backend', name: 'Taylor Cruz', offsetVertical: 14 },
        { id: 'Data', title: 'Data', name: 'Quinn Patel', offsetHorizontal: -12 },
        { id: 'Research', title: 'Research', name: 'Riley Chen', offsetHorizontal: 18, offsetVertical: 12 }
      ],
      colorByPoint: false,
      color: '#4f8fba',
      borderColor: '#1f5ba7',
      dataLabels: {
        color: '#ffffff'
      }
    }]
  } as any;
}

function makeAnnotationCropOptions() {
  return {
    title: { text: 'Annotations crop — Highcharts 9' },
    subtitle: { text: 'Annotations can deliberately render outside the plot area when crop is disabled.' },
    xAxis: {
      min: 0,
      max: 4,
      tickInterval: 1
    },
    yAxis: {
      min: 0,
      max: 80,
      title: { text: 'Requests per minute' }
    },
    annotations: [{
      crop: false,
      labelOptions: {
        backgroundColor: 'rgba(15, 33, 55, 0.92)',
        borderColor: '#0d5c9e',
        style: { color: '#ffffff' }
      },
      labels: [{
        point: { xAxis: 0, yAxis: 0, x: 4.45, y: 74 },
        text: 'Outside the plot area'
      }]
    }],
    series: [{
      type: 'line',
      name: 'Capacity',
      data: [18, 29, 41, 57, 69]
    }]
  } as any;
}

function makeDrilldownBreadcrumbsOptions() {
  return {
    chart: { type: 'column' },
    title: { text: 'Drilldown breadcrumbs — Highcharts 10' },
    subtitle: { text: 'Drilldown charts can keep hierarchical breadcrumbs visible while navigating.' },
    xAxis: { type: 'category' },
    legend: { enabled: false },
    plotOptions: {
      series: {
        borderRadius: 4
      }
    },
    series: [{
      type: 'column',
      name: 'Capabilities',
      colorByPoint: true,
      data: [
        { name: 'Platform', y: 14, drilldown: 'platform' },
        { name: 'Delivery', y: 11, drilldown: 'delivery' },
        { name: 'Insights', y: 9, drilldown: 'insights' }
      ]
    }],
    drilldown: {
      breadcrumbs: {
        position: {
          align: 'right'
        }
      },
      series: [
        {
          id: 'platform',
          type: 'column',
          name: 'Platform',
          data: [['Auth', 5], ['Search', 4], ['Billing', 5]]
        },
        {
          id: 'delivery',
          type: 'column',
          name: 'Delivery',
          data: [['CI', 4], ['QA', 3], ['Releases', 4]]
        },
        {
          id: 'insights',
          type: 'column',
          name: 'Insights',
          data: [['Dashboards', 4], ['Alerts', 2], ['Forecasting', 3]]
        }
      ]
    }
  } as any;
}

function makeAlignThresholdsOptions() {
  return {
    chart: {
      alignThresholds: true
    },
    title: { text: 'Align thresholds — Highcharts 10' },
    subtitle: { text: 'Separate Y axes can align around different threshold values.' },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    yAxis: [
      {
        title: { text: 'Margin delta' },
        min: -20,
        max: 40,
        tickInterval: 10
      },
      {
        title: { text: 'Revenue target' },
        opposite: true,
        min: 80,
        max: 200,
        tickInterval: 20
      }
    ],
    series: [
      {
        type: 'column',
        name: 'Margin delta',
        threshold: 0,
        data: [-8, 6, 14, 19, 11]
      },
      {
        type: 'spline',
        name: 'Revenue target',
        yAxis: 1,
        threshold: 120,
        data: [106, 124, 138, 151, 167]
      }
    ]
  } as any;
}

function makeOrganizationLayoutOptions() {
  return {
    title: { text: 'Organization layout controls — Highcharts 10' },
    subtitle: { text: 'Deep organization charts gained hangingIndentTranslation and minNodeLength controls.' },
    series: [{
      type: 'organization',
      name: 'Support model',
      keys: ['from', 'to'],
      hangingIndent: 24,
      hangingIndentTranslation: 'cumulative',
      minNodeLength: 20,
      data: [
        ['VP Support', 'Support lead'],
        ['Support lead', 'EMEA'],
        ['Support lead', 'Americas'],
        ['EMEA', 'Tier 1'],
        ['EMEA', 'Tier 2'],
        ['Americas', 'Tier 1'],
        ['Americas', 'Tier 2'],
        ['Tier 2', 'Escalations']
      ],
      nodes: [
        { id: 'VP Support', title: 'Director', name: 'Casey Hall' },
        { id: 'Support lead', title: 'Lead', name: 'Morgan Diaz' },
        { id: 'EMEA', title: 'Region', name: 'EMEA' },
        { id: 'Americas', title: 'Region', name: 'Americas' },
        { id: 'Tier 1', title: 'Level', name: 'Tier 1' },
        { id: 'Tier 2', title: 'Level', name: 'Tier 2' },
        { id: 'Escalations', title: 'Path', name: 'Escalations' }
      ],
      colorByPoint: false,
      color: '#4f8fba',
      borderColor: '#1f5ba7',
      dataLabels: {
        color: '#ffffff'
      }
    }]
  } as any;
}

function makeArcDiagramOptions() {
  return {
    title: { text: 'Arc diagram — Highcharts 10' },
    subtitle: { text: 'Relationship flows can render as arcs across a single axis.' },
    series: [{
      type: 'arcdiagram',
      name: 'Flow',
      keys: ['from', 'to', 'weight'],
      linkWeight: 1,
      centeredLinks: true,
      dataLabels: {
        color: '#102033'
      },
      data: [
        ['Discover', 'Plan', 2],
        ['Plan', 'Build', 5],
        ['Build', 'Validate', 4],
        ['Validate', 'Launch', 3],
        ['Build', 'Launch', 2]
      ]
    }]
  } as any;
}

function makeTreegraphOptions() {
  return {
    title: { text: 'Treegraph — Highcharts 11' },
    subtitle: { text: 'Tree structures render natively with a connector-based hierarchy chart.' },
    series: [{
      type: 'treegraph',
      marker: {
        symbol: 'circle',
        radius: 14
      },
      dataLabels: {
        style: {
          textOutline: 'none',
          fontWeight: '600'
        }
      },
      data: [
        { id: 'platform', name: 'Platform' },
        { id: 'api', parent: 'platform', name: 'API' },
        { id: 'web', parent: 'platform', name: 'Web' },
        { id: 'mobile', parent: 'platform', name: 'Mobile' },
        { id: 'auth', parent: 'api', name: 'Auth' },
        { id: 'search', parent: 'api', name: 'Search' },
        { id: 'design-system', parent: 'web', name: 'Design system' },
        { id: 'checkout', parent: 'web', name: 'Checkout' },
        { id: 'ios', parent: 'mobile', name: 'iOS' },
        { id: 'android', parent: 'mobile', name: 'Android' }
      ]
    }]
  } as any;
}

function makeMinorTicksOptions() {
  return {
    title: { text: 'Minor ticks per major — Highcharts 11' },
    subtitle: { text: 'Axes can subdivide each major interval to improve reading precision.' },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 20,
      minorTicksPerMajor: 4,
      title: { text: 'Utilization' }
    },
    series: [{
      type: 'line',
      name: 'Utilization',
      data: [18, 33, 47, 58, 74, 83]
    }]
  } as any;
}

function makePointAndFigureOptions() {
  return {
    rangeSelector: { selected: 1 },
    title: { text: 'Point and figure — Highcharts 12' },
    subtitle: { text: 'Point and figure transforms closing prices into trend columns.' },
    series: [{
      type: 'pointandfigure',
      name: 'PnF close',
      data: generateTimeSeries(),
      boxSize: '2%',
      reversalAmount: 3
    }]
  } as any;
}

function makeRenkoOptions() {
  return {
    rangeSelector: { selected: 1 },
    title: { text: 'Renko — Highcharts 12' },
    subtitle: { text: 'Renko bricks focus on price movement size instead of every time interval.' },
    series: [{
      type: 'renko',
      name: 'Renko close',
      data: generateTimeSeries(),
      boxSize: 3
    }]
  } as any;
}

function makeLocaleOptions() {
  return {
    lang: {
      locale: 'de-DE'
    },
    title: { text: 'Locale-aware formatting — Highcharts 12' },
    subtitle: { text: 'Dates and numbers can follow the selected locale without custom formatter functions.' },
    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%[eb]}'
      }
    },
    yAxis: {
      title: { text: 'Revenue' },
      labels: {
        format: '{value:,.0f} €'
      }
    },
    tooltip: {
      xDateFormat: '%[AebY]',
      valueDecimals: 2,
      valueSuffix: ' €'
    },
    series: [{
      type: 'line',
      name: 'Revenue',
      data: generateTimeSeries().slice(0, 12).map(([x, y]) => [x, Math.round(y * 1250)])
    }]
  } as any;
}

function makeHumanDatesOptions() {
  return {
    title: { text: 'Human-friendly dates — Highcharts 12' },
    subtitle: { text: 'Series data can use readable ISO date strings instead of manual Date.UTC calls.' },
    xAxis: {
      type: 'datetime'
    },
    tooltip: {
      xDateFormat: '%Y-%m-%d'
    },
    series: [{
      type: 'line',
      name: 'Deployments',
      data: [
        ['2025-01-06', 3],
        ['2025-01-13', 5],
        ['2025-01-20', 4],
        ['2025-01-27', 6],
        ['2025-02-03', 7],
        ['2025-02-10', 6],
        ['2025-02-17', 8]
      ]
    }]
  } as any;
}

function DemoCard({ title, description, codes = [], controls, note, full = false, children }: DemoCardProps) {
  return (
    <section className={`demo-card${full ? ' full' : ''}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {codes.map((code, index) => (
        <pre key={`${title}-${index}`} className="code">{code}</pre>
      ))}
      {controls}
      <div className="chart-frame">{children}</div>
      {note ? <div className="note">{note}</div> : null}
    </section>
  );
}

export function App({ reactLine }: AppProps) {
  const eventChartRef = useRef<ChartHandle | null>(null);
  const dynamicChartRef = useRef<ChartHandle | null>(null);
  const zAxisChartRef = useRef<ChartHandle | null>(null);
  const colorAxisChartRef = useRef<ChartHandle | null>(null);

  const logRef = useRef<(message: string) => void>(() => undefined);
  const [entries, setEntries] = useState<string[]>([]);
  const [modulesReady, setModulesReady] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [module3dEnabled, setModule3dEnabled] = useState(true);
  const [moduleOptions, setModuleOptions] = useState<any>(() => makeModuleOptions(true));

  const pushLog = (message: string) => {
    setEntries((current) => [stamp(message), ...current].slice(0, 16));
  };

  logRef.current = pushLog;

  const [demoOptions] = useState(() => {
    const log = (message: string) => logRef.current(message);

    return {
      basicOptions: makeBasicOptions(),
      stockOptions: makeStockOptions(),
      eventOptions: makeEventOptions(log),
      dynamicOptions: makeDynamicOptions(),
      zAxisOptions: makeZAxisOptions(log),
      colorAxisOptions: makeColorAxisOptions(log),
      bulletOptions: makeBulletOptions(),
      xrangeOptions: makeXRangeOptions(),
      timelineOptions: makeTimelineOptions(),
      vennOptions: makeVennOptions(),
      organizationOptions: makeOrganizationOptions(),
      dependencyWheelOptions: makeDependencyWheelOptions(),
      radialBarOptions: makeRadialBarOptions(),
      sortedBarOptions: makeSortedBarOptions(),
      markerClusterOptions: makeMarkerClusterOptions(),
      area3dOptions: makeArea3dOptions(),
      touchZoomOptions: makeTouchZoomOptions(),
      hlcOptions: makeHlcOptions(),
      nodeOffsetsOptions: makeNodeOffsetsOptions(),
      annotationCropOptions: makeAnnotationCropOptions(),
      drilldownBreadcrumbsOptions: makeDrilldownBreadcrumbsOptions(),
      alignThresholdsOptions: makeAlignThresholdsOptions(),
      organizationLayoutOptions: makeOrganizationLayoutOptions(),
      arcDiagramOptions: makeArcDiagramOptions(),
      treegraphOptions: makeTreegraphOptions(),
      minorTicksOptions: makeMinorTicksOptions(),
      pointAndFigureOptions: makePointAndFigureOptions(),
      renkoOptions: makeRenkoOptions(),
      localeOptions: makeLocaleOptions(),
      humanDatesOptions: makeHumanDatesOptions()
    };
  });

  useEffect(() => {
    pushLog('Demo loaded successfully.');
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOptionalModules() {
      try {
        exposeHighchartsGlobals(Highcharts);

        const modules = [];

        for (const loader of OPTIONAL_MODULE_LOADERS) {
          modules.push(await loader.load());
        }

        initHighchartsModules(Highcharts, ...modules);

        if (!mounted) {
          return;
        }

        setModulesReady(true);
        pushLog('Optional modules loaded.');
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unknown module loader error.';
        setModuleError(message);
        pushLog('Optional modules failed to load.');
        pushLog(`Module error: ${message}`);
      }
    }

    loadOptionalModules();

    return () => {
      mounted = false;
    };
  }, []);

  const getChart = (chartRef: { current: ChartHandle | null }) => chartRef.current?.chart as any;

  const zoomEventX = () => {
    getChart(eventChartRef)?.xAxis?.[0]?.setExtremes(1, 4);
  };

  const zoomEventY = () => {
    getChart(eventChartRef)?.yAxis?.[0]?.setExtremes(20, 90);
  };

  const resetEventAxes = () => {
    const chart = getChart(eventChartRef);
    chart?.xAxis?.[0]?.setExtremes(null, null);
    chart?.yAxis?.[0]?.setExtremes(null, null);
    pushLog('Axes reset.');
  };

  const addPoint = () => {
    const chart = getChart(dynamicChartRef);
    if (!chart) {
      return;
    }

    const value = Math.round((Math.random() * 14 + 4) * 10) / 10;
    chart.series[0].addPoint(value, true, false);
    pushLog(`Point added: ${value}`);
  };

  const removePoint = () => {
    const chart = getChart(dynamicChartRef);
    if (!chart || !chart.series[0].data.length) {
      return;
    }

    chart.series[0].data[0].remove(false);
    chart.redraw();
    pushLog('First point removed.');
  };

  const randomize = () => {
    const chart = getChart(dynamicChartRef);
    if (!chart) {
      return;
    }

    const next: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      next.push(Math.round((Math.random() * 18 + 2) * 10) / 10);
    }

    chart.series[0].setData(next, true);
    pushLog(`Series randomised: ${next.join(', ')}`);
  };

  const renameChart = () => {
    const chart = getChart(dynamicChartRef);
    if (!chart) {
      return;
    }

    const now = new Date();
    const label = `Updated at ${now.toLocaleTimeString('en-US', { hour12: false })}`;
    chart.setTitle({ text: label });
    pushLog(`Title set to "${label}".`);
  };

  const zoomZ = () => {
    getChart(zAxisChartRef)?.zAxis?.[0]?.setExtremes(2, 8);
  };

  const resetZ = () => {
    getChart(zAxisChartRef)?.zAxis?.[0]?.setExtremes(null, null);
    pushLog('zAxis reset.');
  };

  const zoomColor = () => {
    getChart(colorAxisChartRef)?.colorAxis?.[0]?.setExtremes(2, 7);
  };

  const resetColor = () => {
    getChart(colorAxisChartRef)?.colorAxis?.[0]?.setExtremes(null, null);
    pushLog('colorAxis reset.');
  };

  const toggle3d = () => {
    setModule3dEnabled((current) => {
      const next = !current;
      setModuleOptions(makeModuleOptions(next));
      pushLog(`3D ${next ? 'enabled' : 'disabled'}.`);
      return next;
    });
  };

  const clearLog = () => {
    setEntries([stamp('Log cleared.')]);
  };

  const renderChart = (
    options: any,
    {
      stock = false,
      chartRef,
      requiresModules = false
    }: {
      stock?: boolean;
      chartRef?: any;
      requiresModules?: boolean;
    } = {}
  ) => {
    if (requiresModules && !modulesReady) {
      return <div className="chart-host chart-placeholder">Loading optional modules…</div>;
    }

    return (
      <Chart
        ref={chartRef}
        highcharts={Highcharts as any}
        constructorType={stock ? 'stockChart' : 'chart'}
        options={options}
        containerProps={{ className: 'chart-host' }}
      />
    );
  };

  const {
    basicOptions,
    stockOptions,
    eventOptions,
    dynamicOptions,
    zAxisOptions,
    colorAxisOptions,
    bulletOptions,
    xrangeOptions,
    timelineOptions,
    vennOptions,
    organizationOptions,
    dependencyWheelOptions,
    radialBarOptions,
    sortedBarOptions,
    markerClusterOptions,
    area3dOptions,
    touchZoomOptions,
    hlcOptions,
    nodeOffsetsOptions,
    annotationCropOptions,
    drilldownBreadcrumbsOptions,
    alignThresholdsOptions,
    organizationLayoutOptions,
    arcDiagramOptions,
    treegraphOptions,
    minorTicksOptions,
    pointAndFigureOptions,
    renkoOptions,
    localeOptions,
    humanDatesOptions
  } = demoOptions;

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-card hero-main">
          <span className="badge">React {reactLine} · Highcharts 12</span>
          <h1>@revivejs/react-highcharts</h1>
          <p>
            A thin, community-style React wrapper for Highcharts, StockChart, 3D charts, heatmaps,
            drilldowns, renko charts and point-and-figure series. Pass the Highcharts instance,
            pass the options object, and keep the native chart available through a ref.
          </p>
          <div className="feature-grid">
            <div className="feature">
              <strong>Zero magic</strong>
              The wrapper stays intentionally close to the native Highcharts API.
            </div>
            <div className="feature">
              <strong>Option callbacks</strong>
              Highcharts events stay in the options object and call back into React closures.
            </div>
            <div className="feature">
              <strong>Native instance</strong>
              Reach the <code>Highcharts.Chart</code> object through a normal React ref.
            </div>
            <div className="feature">
              <strong>Optional modules</strong>
              3D, heatmap, venn, treegraph, renko and more can be initialized once at startup.
            </div>
          </div>
          <div className="cta-row">
            <a className="btn" href="#demos">See demos</a>
            <a className="btn secondary" href="https://github.com/alexandroit/react-highcharts#readme" target="_blank" rel="noreferrer">README</a>
          </div>
        </div>

        <div className="hero-card hero-setup">
          <h2>Setup in 3 steps</h2>

          <div className="step">
            <span className="step-num">1</span>
            <div>
              <strong>Install</strong>
              <pre>{INSTALL_CODE}</pre>
            </div>
          </div>

          <div className="step">
            <span className="step-num">2</span>
            <div>
              <strong>Render your first chart</strong>
              <pre>{SETUP_CODE}</pre>
            </div>
          </div>

          <div className="step">
            <span className="step-num">3</span>
            <div>
              <strong>Enable modules once</strong>
              <pre>{MODULE_CODE}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="layout" id="demos">
        <div className="panels">
          <article className="panel">
            <div className="panel-header">
              <h2>Core — basic usage</h2>
              <p>These two demos cover most day-to-day usage in React applications.</p>
            </div>
            <div className="demo-grid">
              <DemoCard
                title="Basic chart"
                description="Pass a standard Highcharts options object to the wrapper."
                codes={[SETUP_CODE, simpleChartCode('basicOptions')]}
              >
                {renderChart(basicOptions)}
              </DemoCard>

              <DemoCard
                title="StockChart"
                description="Switch constructors with the stockChart constructor type."
                codes={[STOCK_CODE, simpleStockCode('stockOptions')]}
              >
                {renderChart(stockOptions, { stock: true })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Option callbacks</h2>
              <p>
                React apps keep Highcharts events in the options object. Selection, point selection,
                series hover, and axis extremes can all feed your component state directly.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard
                full
                title="Chart, series and point events"
                description="Drag to zoom, hover the series, click a point, and watch the Event Log update."
                codes={[EVENT_CODE]}
                controls={(
                  <div className="controls">
                    <button onClick={zoomEventX}>Zoom X</button>
                    <button className="secondary" onClick={zoomEventY}>Zoom Y</button>
                    <button className="ghost" onClick={resetEventAxes}>Reset axes</button>
                  </div>
                )}
                note={(
                  <>
                    Drag over the chart to select a range, hover the column series, or click a point.
                    Every callback appears in the <strong>Event Log</strong> on the right.
                  </>
                )}
              >
                {renderChart(eventOptions, { chartRef: eventChartRef })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Native instance access</h2>
              <p>
                The wrapper stays intentionally thin. For imperative mutations, capture the native
                chart object from a React ref and call the Highcharts API directly.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard
                full
                title="Imperative mutations via the Highcharts API"
                description="Use the chart ref to add points, replace series data, or rename the chart."
                codes={[IMPERATIVE_CODE]}
                controls={(
                  <div className="controls">
                    <button onClick={addPoint}>Add point</button>
                    <button className="secondary" onClick={randomize}>Randomise series</button>
                    <button className="secondary" onClick={renameChart}>Rename chart</button>
                    <button className="ghost" onClick={removePoint}>Remove 1st point</button>
                  </div>
                )}
              >
                {renderChart(dynamicOptions, { chartRef: dynamicChartRef })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Advanced axes and modules</h2>
              <p>
                The wrapper does not hide native axis features. <code>zAxis</code>, <code>colorAxis</code>,
                and 3D options stay right inside your Highcharts configuration.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard
                title="zAxis in 3D scatter"
                description="Clamp and reset the zAxis through the native chart instance."
                codes={[simpleChartCode('zAxisOptions')]}
                controls={(
                  <div className="controls">
                    <button className="secondary" onClick={zoomZ}>Clamp Z</button>
                    <button className="ghost" onClick={resetZ}>Reset Z</button>
                  </div>
                )}
              >
                {renderChart(zAxisOptions, { chartRef: zAxisChartRef, requiresModules: true })}
                {moduleError ? <p className="module-error">{moduleError}</p> : null}
              </DemoCard>

              <DemoCard
                title="colorAxis in heatmaps"
                description="Narrow and reset the color range using the live colorAxis instance."
                codes={[simpleChartCode('colorAxisOptions')]}
                controls={(
                  <div className="controls">
                    <button className="secondary" onClick={zoomColor}>Narrow range</button>
                    <button className="ghost" onClick={resetColor}>Reset colour</button>
                  </div>
                )}
              >
                {renderChart(colorAxisOptions, { chartRef: colorAxisChartRef, requiresModules: true })}
                {moduleError ? <p className="module-error">{moduleError}</p> : null}
              </DemoCard>

              <DemoCard
                full
                title="Toggle 3D at runtime"
                description="Reassign the options object to switch the 3D module on and off."
                codes={[`setModuleOptions(makeModuleOptions(nextEnabled));`, simpleChartCode('moduleOptions')]}
                controls={(
                  <div className="controls">
                    <button onClick={toggle3d}>{module3dEnabled ? 'Disable 3D' : 'Enable 3D'}</button>
                  </div>
                )}
              >
                {renderChart(moduleOptions, { requiresModules: true })}
                {moduleError ? <p className="module-error">{moduleError}</p> : null}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 6 — retained chart types</h2>
              <p>
                The React wrapper can still demonstrate the Highcharts 6 additions such as bullet
                and x-range charts without changing the wrapper API.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard
                title="Bullet chart"
                description="Compare an actual value to a target with qualitative bands."
                codes={[`import('highcharts/modules/bullet.js')`, simpleChartCode('bulletOptions')]}
              >
                {renderChart(bulletOptions, { requiresModules: true })}
              </DemoCard>

              <DemoCard
                title="X-Range chart"
                description="Render project phases as horizontal date ranges."
                codes={[`import('highcharts/modules/xrange.js')`, simpleChartCode('xrangeOptions')]}
              >
                {renderChart(xrangeOptions, { requiresModules: true })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 7 — storytelling and relationship charts</h2>
              <p>
                Timeline, venn, organization and dependency wheel charts all work with the same
                <code>&lt;Chart /&gt;</code> component once their modules are initialized.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard title="Timeline chart" description="Chronological milestones on a single track." codes={[simpleChartCode('timelineOptions')]}>
                {renderChart(timelineOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Venn diagram" description="Visualise overlap between sets." codes={[simpleChartCode('vennOptions')]}>
                {renderChart(vennOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Organization chart" description="Hierarchy charts powered by the sankey engine." codes={[simpleChartCode('organizationOptions')]}>
                {renderChart(organizationOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Dependency wheel" description="Circular flow relationships between application layers." codes={[simpleChartCode('dependencyWheelOptions')]}>
                {renderChart(dependencyWheelOptions, { requiresModules: true })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 8 — interaction-heavy visuals</h2>
              <p>
                React keeps the Highcharts 8 capabilities available, including radial bar layouts,
                data sorting, and marker clusters.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard title="Radial bar chart" description="A circular bar layout for KPI comparisons." codes={[simpleChartCode('radialBarOptions')]}>
                {renderChart(radialBarOptions)}
              </DemoCard>
              <DemoCard title="Data sorting" description="Animated category sorting through declarative series options." codes={[simpleChartCode('sortedBarOptions')]}>
                {renderChart(sortedBarOptions)}
              </DemoCard>
              <DemoCard title="Marker clusters" description="Group dense scatter points visually with the marker-clusters module." codes={[simpleChartCode('markerClusterOptions')]}>
                {renderChart(markerClusterOptions, { requiresModules: true })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 9 — retained capabilities</h2>
              <p>
                Highcharts 9 added 3D area charts, single-touch zoom, HLC stock series,
                organization node offsets, and annotation crop controls.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard title="3D area chart" description="Area series inside a 3D chart." codes={[simpleChartCode('area3dOptions')]}>
                {renderChart(area3dOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Single-touch zoom" description="Enable one-finger zooming for touch users." codes={[simpleChartCode('touchZoomOptions')]}>
                {renderChart(touchZoomOptions)}
              </DemoCard>
              <DemoCard title="HLC stock series" description="Use the HLC stock series type through the stock constructor." codes={[simpleStockCode('hlcOptions')]}>
                {renderChart(hlcOptions, { stock: true })}
              </DemoCard>
              <DemoCard title="Organization node offsets" description="Nudge nodes with offsetHorizontal and offsetVertical." codes={[simpleChartCode('nodeOffsetsOptions')]}>
                {renderChart(nodeOffsetsOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Annotations crop" description="Render annotation labels outside the plot area when crop is disabled." codes={[simpleChartCode('annotationCropOptions')]}>
                {renderChart(annotationCropOptions, { requiresModules: true })}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 10 and 11 — retained capabilities</h2>
              <p>
                Drilldown breadcrumbs, aligned thresholds, organization layout tuning, arc diagrams,
                treegraph series, and minor ticks per major remain available in the same wrapper.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard title="Drilldown breadcrumbs" description="Keep breadcrumb navigation visible while drilling into data." codes={[simpleChartCode('drilldownBreadcrumbsOptions')]}>
                {renderChart(drilldownBreadcrumbsOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Align thresholds" description="Align multiple Y axes around different thresholds." codes={[simpleChartCode('alignThresholdsOptions')]}>
                {renderChart(alignThresholdsOptions)}
              </DemoCard>
              <DemoCard title="Organization layout controls" description="Use hangingIndentTranslation and minNodeLength in deep hierarchies." codes={[simpleChartCode('organizationLayoutOptions')]}>
                {renderChart(organizationLayoutOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Arc diagram" description="Render relationship flows as arcs across a single line." codes={[simpleChartCode('arcDiagramOptions')]}>
                {renderChart(arcDiagramOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Treegraph" description="Render collapsible tree structures without sankey layout rules." codes={[simpleChartCode('treegraphOptions')]}>
                {renderChart(treegraphOptions, { requiresModules: true })}
              </DemoCard>
              <DemoCard title="Minor ticks per major" description="Subdivide major intervals for easier scale reading." codes={[simpleChartCode('minorTicksOptions')]}>
                {renderChart(minorTicksOptions)}
              </DemoCard>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Highcharts 12 — maintained latest line</h2>
              <p>
                The React wrapper keeps Highcharts 12.5 as the latest maintained line,
                so point-and-figure, renko, locale-aware formatting, and human-friendly dates
                stay part of the live documentation set.
              </p>
            </div>
            <div className="demo-grid">
              <DemoCard title="Point and figure" description="Trend-focused stock columns without time-based bars." codes={[simpleStockCode('pointAndFigureOptions')]}>
                {renderChart(pointAndFigureOptions, { stock: true, requiresModules: true })}
              </DemoCard>
              <DemoCard title="Renko" description="Price-movement bricks instead of per-interval candlesticks." codes={[simpleStockCode('renkoOptions')]}>
                {renderChart(renkoOptions, { stock: true, requiresModules: true })}
              </DemoCard>
              <DemoCard title="Locale-aware formatting" description="Use lang.locale and locale-aware date tokens." codes={[simpleChartCode('localeOptions')]}>
                {renderChart(localeOptions)}
              </DemoCard>
              <DemoCard title="Human-friendly dates" description="Feed ISO-style date strings directly into datetime series data." codes={[simpleChartCode('humanDatesOptions')]}>
                {renderChart(humanDatesOptions)}
              </DemoCard>
            </div>
          </article>

          <article className="panel ref-panel">
            <div className="panel-header">
              <h2>Quick API reference</h2>
            </div>
            <div className="ref-grid">
              <div className="ref-card">
                <h4>{'<Chart />'} props</h4>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><code>highcharts</code></td><td>Highcharts instance</td><td>Required. Pass the bundle or instance you want to use.</td></tr>
                    <tr><td><code>options</code></td><td>Highcharts.Options</td><td>Required. Native chart options object.</td></tr>
                    <tr><td><code>constructorType</code></td><td>string</td><td><code>chart</code>, <code>stockChart</code>, <code>mapChart</code> or <code>ganttChart</code>.</td></tr>
                    <tr><td><code>callback</code></td><td>function</td><td>Called after the chart instance is created.</td></tr>
                    <tr><td><code>allowChartUpdate</code></td><td>boolean</td><td>Skip chart.update calls when you want to manage redraws yourself.</td></tr>
                    <tr><td><code>immutable</code></td><td>boolean</td><td>Recreate the chart instead of calling <code>chart.update</code>.</td></tr>
                    <tr><td><code>updateArgs</code></td><td>tuple</td><td>Forwarded to <code>chart.update</code>.</td></tr>
                    <tr><td><code>containerProps</code></td><td>HTML props</td><td>Applied to the chart host container.</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="ref-card">
                <h4>Ref surface</h4>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Ref field</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><code>chart</code></td><td>The native <code>Highcharts.Chart</code> instance.</td></tr>
                    <tr><td><code>container</code></td><td>The underlying DOM element used as the chart host.</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="ref-card">
                <h4>Module helpers</h4>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Helper</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><code>exposeHighchartsGlobals</code></td><td>Expose <code>Highcharts</code> and <code>_Highcharts</code> on the global scope before loading modules.</td></tr>
                    <tr><td><code>initHighchartsModules</code></td><td>Apply UMD/ESM module factories once to the target Highcharts instance.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>

        <aside className="log-panel">
          <h2>Event Log</h2>
          <p>Interact with the demos to see Highcharts callbacks appear here.</p>
          <div className="log-controls">
            <button className="ghost small" onClick={clearLog}>Clear</button>
          </div>
          <div className="log-list">
            {entries.map((entry, index) => (
              <div key={`${entry}-${index}`} className="log-entry">{entry}</div>
            ))}
          </div>
        </aside>
      </section>

      <footer className="footer">
        <p>
          <strong>@revivejs/react-highcharts</strong> keeps the wrapper intentionally thin so React stays in charge
          of state while Highcharts stays in charge of rendering, interactivity, and advanced chart types.
        </p>
      </footer>
    </div>
  );
}
