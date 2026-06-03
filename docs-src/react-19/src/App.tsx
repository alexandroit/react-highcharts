import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import Highcharts from 'highcharts/highstock';
import {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules,
  type ChartHandle,
  type HighchartsModuleFactory
} from '@stackline/react-highcharts';

Highcharts.setOptions({
  colors: ['#0d5c9e', '#30a46c', '#d26a2a', '#b43f3f', '#6d52b5']
});

const INSTALL_CODE = `npm install @stackline/react-highcharts@19.0.0 highcharts@12.6.0 --save-exact`;

const SETUP_CODE = `import Highcharts from 'highcharts/highstock';\nimport { Chart } from '@stackline/react-highcharts';\n\n<Chart highcharts={Highcharts} options={myOptions} />`;

const STOCK_CODE = `import Highcharts from 'highcharts/highstock';\n\n<Chart\n  highcharts={Highcharts}\n  constructorType="stockChart"\n  options={stockOptions}\n/>`;

type HighchartsModuleLoader = {
  name: string;
  load: () => Promise<unknown>;
};

const OPTIONAL_MODULE_LOADERS: HighchartsModuleLoader[] = [
  { name: 'highcharts/highcharts-more.js', load: () => import('highcharts/highcharts-more.js') },
  { name: 'highcharts/highcharts-3d.js', load: () => import('highcharts/highcharts-3d.js') },
  { name: 'highcharts/modules/heatmap.js', load: () => import('highcharts/modules/heatmap.js') },
  { name: 'highcharts/modules/treemap.js', load: () => import('highcharts/modules/treemap.js') },
  { name: 'highcharts/modules/funnel.js', load: () => import('highcharts/modules/funnel.js') },
  { name: 'highcharts/modules/solid-gauge.js', load: () => import('highcharts/modules/solid-gauge.js') },
  { name: 'highcharts/modules/stock.js', load: () => import('highcharts/modules/stock.js') },
  { name: 'highcharts/modules/map.js', load: () => import('highcharts/modules/map.js') },
  { name: 'highcharts/modules/drilldown.js', load: () => import('highcharts/modules/drilldown.js') },
  { name: 'highcharts/modules/sankey.js', load: () => import('highcharts/modules/sankey.js') },
  { name: 'highcharts/modules/dependency-wheel.js', load: () => import('highcharts/modules/dependency-wheel.js') },
  { name: 'highcharts/modules/networkgraph.js', load: () => import('highcharts/modules/networkgraph.js') },
  { name: 'highcharts/modules/sunburst.js', load: () => import('highcharts/modules/sunburst.js') },
  { name: 'highcharts/modules/wordcloud.js', load: () => import('highcharts/modules/wordcloud.js') },
  { name: 'highcharts/modules/bullet.js', load: () => import('highcharts/modules/bullet.js') },
  { name: 'highcharts/modules/xrange.js', load: () => import('highcharts/modules/xrange.js') },
  { name: 'highcharts/modules/venn.js', load: () => import('highcharts/modules/venn.js') },
  { name: 'highcharts/modules/timeline.js', load: () => import('highcharts/modules/timeline.js') },
  { name: 'highcharts/modules/variwide.js', load: () => import('highcharts/modules/variwide.js') },
  { name: 'highcharts/modules/variable-pie.js', load: () => import('highcharts/modules/variable-pie.js') },
  { name: 'highcharts/modules/item-series.js', load: () => import('highcharts/modules/item-series.js') },
  { name: 'highcharts/modules/streamgraph.js', load: () => import('highcharts/modules/streamgraph.js') },
  { name: 'highcharts/modules/marker-clusters.js', load: () => import('highcharts/modules/marker-clusters.js') },
  { name: 'highcharts/modules/annotations.js', load: () => import('highcharts/modules/annotations.js') },
  { name: 'highcharts/modules/drilldown.js', load: () => import('highcharts/modules/drilldown.js') },
  { name: 'highcharts/modules/arc-diagram.js', load: () => import('highcharts/modules/arc-diagram.js') },
  { name: 'highcharts/modules/treegraph.js', load: () => import('highcharts/modules/treegraph.js') },
  { name: 'highcharts/modules/cylinder.js', load: () => import('highcharts/modules/cylinder.js') },
  { name: 'highcharts/modules/dumbbell.js', load: () => import('highcharts/modules/dumbbell.js') },
  { name: 'highcharts/modules/dotplot.js', load: () => import('highcharts/modules/dotplot.js') },
  { name: 'highcharts/modules/funnel3d.js', load: () => import('highcharts/modules/funnel3d.js') },
  { name: 'highcharts/modules/heikinashi.js', load: () => import('highcharts/modules/heikinashi.js') },
  { name: 'highcharts/modules/hollowcandlestick.js', load: () => import('highcharts/modules/hollowcandlestick.js') },
  { name: 'highcharts/modules/lollipop.js', load: () => import('highcharts/modules/lollipop.js') },
  { name: 'highcharts/modules/parallel-coordinates.js', load: () => import('highcharts/modules/parallel-coordinates.js') },
  { name: 'highcharts/modules/pareto.js', load: () => import('highcharts/modules/pareto.js') },
  { name: 'highcharts/modules/histogram-bellcurve.js', load: () => import('highcharts/modules/histogram-bellcurve.js') },
  { name: 'highcharts/modules/pyramid3d.js', load: () => import('highcharts/modules/pyramid3d.js') },
  { name: 'highcharts/modules/tilemap.js', load: () => import('highcharts/modules/tilemap.js') },
  { name: 'highcharts/modules/vector.js', load: () => import('highcharts/modules/vector.js') },
  { name: 'highcharts/modules/windbarb.js', load: () => import('highcharts/modules/windbarb.js') },
  { name: 'highcharts/modules/flowmap.js', load: () => import('highcharts/modules/flowmap.js') },
  { name: 'highcharts/modules/geoheatmap.js', load: () => import('highcharts/modules/geoheatmap.js') },
  { name: 'highcharts/modules/pictorial.js', load: () => import('highcharts/modules/pictorial.js') },
  { name: 'highcharts/modules/contour.js', load: () => import('highcharts/modules/contour.js') },
  { name: 'highcharts/modules/organization.js', load: () => import('highcharts/modules/organization.js') },
  { name: 'highcharts/modules/pointandfigure.js', load: () => import('highcharts/modules/pointandfigure.js') },
  { name: 'highcharts/modules/renko.js', load: () => import('highcharts/modules/renko.js') },
  { name: 'highcharts/modules/no-data-to-display.js', load: () => import('highcharts/modules/no-data-to-display.js') },
  { name: 'highcharts/modules/accessibility.js', load: () => import('highcharts/modules/accessibility.js') }
];

const CRITICAL_MODULE_LOADERS = OPTIONAL_MODULE_LOADERS.filter((loader) => (
  loader.name === 'highcharts/highcharts-more.js' ||
  loader.name === 'highcharts/highcharts-3d.js' ||
  loader.name === 'highcharts/modules/stock.js' ||
  loader.name === 'highcharts/modules/map.js' ||
  loader.name === 'highcharts/modules/heatmap.js' ||
  loader.name === 'highcharts/modules/treemap.js' ||
  loader.name === 'highcharts/modules/funnel.js' ||
  loader.name === 'highcharts/modules/solid-gauge.js' ||
  loader.name === 'highcharts/modules/cylinder.js' ||
  loader.name === 'highcharts/modules/funnel3d.js' ||
  loader.name === 'highcharts/modules/pyramid3d.js' ||
  loader.name === 'highcharts/modules/dotplot.js' ||
  loader.name === 'highcharts/modules/parallel-coordinates.js' ||
  loader.name === 'highcharts/modules/heikinashi.js' ||
  loader.name === 'highcharts/modules/hollowcandlestick.js' ||
  loader.name === 'highcharts/modules/vector.js' ||
  loader.name === 'highcharts/modules/windbarb.js' ||
  loader.name === 'highcharts/modules/flowmap.js' ||
  loader.name === 'highcharts/modules/geoheatmap.js' ||
  loader.name === 'highcharts/modules/pictorial.js' ||
  loader.name === 'highcharts/modules/contour.js' ||
  loader.name === 'highcharts/modules/renko.js' ||
  loader.name === 'highcharts/modules/pointandfigure.js'
));

const OPTIONAL_DEFERRED_MODULE_LOADERS = OPTIONAL_MODULE_LOADERS.filter((loader) => (
  !CRITICAL_MODULE_LOADERS.some((criticalLoader) => criticalLoader.name === loader.name)
));

const MODULE_CODE = `import Highcharts from 'highcharts/highstock';\nimport {\n  exposeHighchartsGlobals,\n  initHighchartsModules\n} from '@stackline/react-highcharts';\n\nconst moduleLoaders = [\n  () => import('highcharts/highcharts-more.js'),\n  () => import('highcharts/highcharts-3d.js'),\n  () => import('highcharts/modules/map.js'),\n  () => import('highcharts/modules/heatmap.js'),\n  () => import('highcharts/modules/treemap.js'),\n  () => import('highcharts/modules/drilldown.js'),\n  () => import('highcharts/modules/sankey.js'),\n  () => import('highcharts/modules/networkgraph.js'),\n  () => import('highcharts/modules/treegraph.js'),\n  () => import('highcharts/modules/pointandfigure.js'),\n  () => import('highcharts/modules/renko.js')\n];\n\nexposeHighchartsGlobals(Highcharts);\n\nconst modules = [];\nfor (const load of moduleLoaders) {\n  modules.push(await load());\n}\n\ninitHighchartsModules(Highcharts, ...modules);`;

let criticalModulesReady = false;
let criticalModuleError: string | null = null;
let preloadCriticalModulesPromise: Promise<void> | null = null;
let optionalModulesReady = false;
let optionalModuleError: string | null = null;
let preloadOptionalModulesPromise: Promise<void> | null = null;

async function loadHighchartsModules(loaders: HighchartsModuleLoader[]) {
  const errors: string[] = [];

  exposeHighchartsGlobals(Highcharts);

  for (const loader of loaders) {
    try {
      const module = (await loader.load()) as HighchartsModuleFactory;
      initHighchartsModules(Highcharts, module);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown module loader error.';
      errors.push(`${loader.name}: ${message}`);
      console.error(`Highcharts module failed: ${loader.name}`, error);
    }
  }

  return errors;
}

export function preloadHighchartsModules() {
  if (preloadCriticalModulesPromise) {
    return preloadCriticalModulesPromise;
  }

  preloadCriticalModulesPromise = (async () => {
    const errors = await loadHighchartsModules(CRITICAL_MODULE_LOADERS);
    criticalModuleError = errors.length ? errors.join('\n') : null;
    criticalModulesReady = true;
  })();

  return preloadCriticalModulesPromise;
}

function preloadOptionalHighchartsModules() {
  if (preloadOptionalModulesPromise) {
    return preloadOptionalModulesPromise;
  }

  preloadOptionalModulesPromise = (async () => {
    try {
      await preloadHighchartsModules();
      const errors = await loadHighchartsModules(OPTIONAL_DEFERRED_MODULE_LOADERS);
      optionalModuleError = errors.length ? errors.join('\n') : null;
      optionalModulesReady = true;
    } catch (error) {
      optionalModuleError = error instanceof Error ? error.message : 'Unknown module loader error.';
    }
  })();

  return preloadOptionalModulesPromise;
}

const EVENT_CODE = `const eventChartRef = useRef<ChartHandle>(null);\n\nconst eventOptions = {\n  chart: {\n    zoomType: 'xy',\n    events: {\n      selection(event) {\n        const axis = event.xAxis?.[0];\n        if (axis) {\n          pushLog(\`Selection: \${axis.min?.toFixed(2)} to \${axis.max?.toFixed(2)}\`);\n        }\n      }\n    }\n  },\n  xAxis: {\n    events: {\n      afterSetExtremes(event) {\n        pushLog(\`X extremes: \${event.min} to \${event.max}\`);\n      }\n    }\n  }\n};`;

const IMPERATIVE_CODE = `const chartRef = useRef<ChartHandle>(null);\n\nchartRef.current?.chart?.series[0]?.addPoint(28);\nchartRef.current?.chart?.setTitle({ text: 'Updated at 14:12:03' });`;

type AppProps = {
  reactLine: string;
};

type DemoCardProps = {
  title: string;
  description: string;
  codes?: string[];
  label?: string;
  codeLabel?: string;
  scssCode?: string;
  controls?: ReactNode;
  note?: ReactNode;
  full?: boolean;
  children: ReactNode;
};

type MatrixExample = {
  title: string;
  description: string;
  options: any;
  stock?: boolean;
  requiresModules?: boolean;
};

type CandlePoint = [number, number, number, number, number];

type VolumePoint = {
  x: number;
  y: number;
  color: string;
};

type MarketRow = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  quoteVolume: number;
  baseVolume: number;
  trades: number;
  high: number;
  low: number;
};

type CryptoTreemapRow = {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  changePercent: number;
};

type DynamicExample = {
  title: string;
  description: string;
  options: any;
  constructorType?: 'chart' | 'stockChart';
  allowChartUpdate?: boolean;
  tutorialHtml: string;
  tutorialTs: string;
  tutorialScss: string;
};

const BINANCE_REST_BASE = 'https://api-b.alexandro.net/api/v3';
const BINANCE_WS_BASE = 'wss://api-b.alexandro.net/ws';
const BINANCE_STREAM_BASE = 'wss://api-b.alexandro.net/stream?streams=';
const COINGECKO_TREEMAP_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';
const BINANCE_SYMBOLS = ['BNBUSDT', 'BTCUSDT'];
const BINANCE_INTERVALS = ['1s', '1m', '15m', '1h', '4h', '1d', '1w'];
const TRACKED_MARKETS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'TRXUSDT'];

const FALLBACK_MARKETS: MarketRow[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 66030, changePercent: -2.06, quoteVolume: 1520000000, baseVolume: 23000, trades: 1240000, high: 68200, low: 65200 },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 1835.39, changePercent: -3.97, quoteVolume: 940000000, baseVolume: 512000, trades: 880000, high: 1915, low: 1804 },
  { symbol: 'USDTUSDT', name: 'Tether', price: 0.998609, changePercent: 0.03, quoteVolume: 760000000, baseVolume: 761000000, trades: 510000, high: 1.001, low: 0.997 },
  { symbol: 'BNBUSDT', name: 'BNB', price: 631.52, changePercent: -4.45, quoteVolume: 420000000, baseVolume: 665000, trades: 340000, high: 665, low: 626 },
  { symbol: 'XRPUSDT', name: 'XRP', price: 1.22, changePercent: 0.15, quoteVolume: 310000000, baseVolume: 254000000, trades: 290000, high: 1.26, low: 1.17 },
  { symbol: 'SOLUSDT', name: 'SOL', price: 141.4, changePercent: -4.1, quoteVolume: 270000000, baseVolume: 1910000, trades: 230000, high: 149, low: 138 },
  { symbol: 'DOGEUSDT', name: 'DOGE', price: 0.19, changePercent: -2.1, quoteVolume: 180000000, baseVolume: 947000000, trades: 190000, high: 0.2, low: 0.18 },
  { symbol: 'TRXUSDT', name: 'TRX', price: 0.28, changePercent: -0.4, quoteVolume: 150000000, baseVolume: 536000000, trades: 160000, high: 0.29, low: 0.27 }
];

const FALLBACK_MARKET_SYMBOLS = [
  'LINK', 'AVAX', 'DOT', 'MATIC', 'ATOM', 'UNI', 'LTC', 'BCH', 'ETC', 'XLM',
  'FIL', 'APT', 'ARB', 'OP', 'NEAR', 'ICP', 'AAVE', 'MKR', 'INJ', 'SUI',
  'SEI', 'RUNE', 'GRT', 'ALGO', 'FLOW', 'EGLD', 'SAND', 'MANA', 'AXS', 'IMX',
  'KAS', 'TIA', 'FET', 'RENDER', 'JUP', 'PYTH', 'WIF', 'BONK', 'TON', 'HBAR',
  'VET', 'QNT', 'ENS', 'LDO', 'CRV', 'SNX', 'DYDX', 'COMP', 'ZEC', 'DASH'
];

const FALLBACK_TREEMAP_COINS: CryptoTreemapRow[] = [
  { name: 'Bitcoin', symbol: 'BTC', price: 67516, marketCap: 1352661264706, changePercent: -5.67 },
  { name: 'Ethereum', symbol: 'ETH', price: 1922.75, marketCap: 232156210067, changePercent: -3.27 },
  { name: 'Tether', symbol: 'USDT', price: 0.998454, marketCap: 187951404193, changePercent: -0.01 },
  { name: 'BNB', symbol: 'BNB', price: 665.54, marketCap: 89722947955, changePercent: -3.06 },
  { name: 'XRP', symbol: 'XRP', price: 1.23, marketCap: 76555364639, changePercent: -4.94 },
  { name: 'USD Coin', symbol: 'USDC', price: 0.999595, marketCap: 75837344337, changePercent: -0.01 },
  { name: 'Solana', symbol: 'SOL', price: 76.77, marketCap: 44417058835, changePercent: -5.08 },
  { name: 'TRON', symbol: 'TRX', price: 0.337746, marketCap: 32024356142, changePercent: -2.23 },
  { name: 'Dogecoin', symbol: 'DOGE', price: 0.1894, marketCap: 27900000000, changePercent: -2.1 },
  { name: 'Cardano', symbol: 'ADA', price: 0.64, marketCap: 22900000000, changePercent: -1.8 },
  { name: 'Chainlink', symbol: 'LINK', price: 17.18, marketCap: 10100000000, changePercent: -2.2 },
  { name: 'Avalanche', symbol: 'AVAX', price: 22.5, marketCap: 9300000000, changePercent: -1.1 },
  { name: 'Stellar', symbol: 'XLM', price: 0.29, marketCap: 8800000000, changePercent: 1.8 },
  { name: 'Sui', symbol: 'SUI', price: 2.85, marketCap: 8600000000, changePercent: 2.7 },
  { name: 'Litecoin', symbol: 'LTC', price: 91.2, marketCap: 7000000000, changePercent: -0.6 },
  { name: 'Hedera', symbol: 'HBAR', price: 0.16, marketCap: 6400000000, changePercent: 0.5 },
  { name: 'Bitcoin Cash', symbol: 'BCH', price: 324.8, marketCap: 6300000000, changePercent: -1.3 },
  { name: 'Polkadot', symbol: 'DOT', price: 3.88, marketCap: 5900000000, changePercent: -1.5 },
  { name: 'Uniswap', symbol: 'UNI', price: 7.7, marketCap: 4600000000, changePercent: 0.8 },
  { name: 'Aptos', symbol: 'APT', price: 5.8, marketCap: 3900000000, changePercent: -0.9 },
  { name: 'Near Protocol', symbol: 'NEAR', price: 3.15, marketCap: 3700000000, changePercent: 2.1 },
  { name: 'Internet Computer', symbol: 'ICP', price: 7.38, marketCap: 3500000000, changePercent: 0.4 },
  { name: 'Aave', symbol: 'AAVE', price: 214.8, marketCap: 3300000000, changePercent: 1.4 },
  { name: 'Monero', symbol: 'XMR', price: 395.7, marketCap: 3100000000, changePercent: 5.1 },
  { name: 'Ethereum Classic', symbol: 'ETC', price: 18.4, marketCap: 2800000000, changePercent: -0.8 },
  { name: 'VeChain', symbol: 'VET', price: 0.035, marketCap: 2600000000, changePercent: 0.9 },
  { name: 'Cosmos Hub', symbol: 'ATOM', price: 4.2, marketCap: 2400000000, changePercent: -1.2 },
  { name: 'Algorand', symbol: 'ALGO', price: 0.24, marketCap: 2100000000, changePercent: 1.1 },
  { name: 'Filecoin', symbol: 'FIL', price: 3.4, marketCap: 2050000000, changePercent: -2.4 },
  { name: 'Maker', symbol: 'MKR', price: 1840, marketCap: 1700000000, changePercent: 0.6 },
  { name: 'Injective', symbol: 'INJ', price: 13.4, marketCap: 1320000000, changePercent: -1.7 },
  { name: 'Arbitrum', symbol: 'ARB', price: 0.42, marketCap: 1280000000, changePercent: -0.5 },
  { name: 'Optimism', symbol: 'OP', price: 0.71, marketCap: 1240000000, changePercent: 0.2 },
  { name: 'The Graph', symbol: 'GRT', price: 0.12, marketCap: 1160000000, changePercent: 0.9 },
  { name: 'Render', symbol: 'RENDER', price: 2.8, marketCap: 1100000000, changePercent: 2.8 },
  { name: 'Fantom', symbol: 'FTM', price: 0.38, marketCap: 1070000000, changePercent: -1.1 },
  { name: 'Quant', symbol: 'QNT', price: 83.2, marketCap: 1000000000, changePercent: 0.3 },
  { name: 'Flow', symbol: 'FLOW', price: 0.61, marketCap: 940000000, changePercent: -0.7 },
  { name: 'Theta Network', symbol: 'THETA', price: 0.84, marketCap: 840000000, changePercent: 1.6 },
  { name: 'Immutable', symbol: 'IMX', price: 0.49, marketCap: 815000000, changePercent: -1.6 },
  { name: 'The Sandbox', symbol: 'SAND', price: 0.28, marketCap: 705000000, changePercent: 0.4 },
  { name: 'Decentraland', symbol: 'MANA', price: 0.27, marketCap: 680000000, changePercent: -0.3 },
  { name: 'Lido DAO', symbol: 'LDO', price: 0.72, marketCap: 645000000, changePercent: 1.2 },
  { name: 'Curve', symbol: 'CRV', price: 0.58, marketCap: 610000000, changePercent: -0.9 },
  { name: 'Compound', symbol: 'COMP', price: 48.4, marketCap: 520000000, changePercent: 0.7 },
  { name: 'Dash', symbol: 'DASH', price: 42.2, marketCap: 505000000, changePercent: -0.4 },
  { name: 'Zcash', symbol: 'ZEC', price: 62.5, marketCap: 495000000, changePercent: 1.8 },
  { name: 'Pyth Network', symbol: 'PYTH', price: 0.15, marketCap: 455000000, changePercent: -0.8 },
  { name: 'Sei', symbol: 'SEI', price: 0.2, marketCap: 430000000, changePercent: 0.9 },
  { name: 'Jupiter', symbol: 'JUP', price: 0.36, marketCap: 410000000, changePercent: 1.5 }
];

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

function makeChartTypeMatrixExamples(): MatrixExample[] {
  const baseCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseValues = [29, 42, 55, 61, 73, 88];
  const peerValues = [18, 33, 41, 49, 64, 70];
  const scatterData = [[1, 4], [2, 6], [3, 5], [4, 9], [5, 7], [6, 11]];
  const bubbleData = [[1, 4, 6], [2, 6, 9], [3, 5, 7], [4, 9, 11], [5, 7, 8], [6, 11, 13]];

  const basic = (title: string, type: string, description: string): MatrixExample => ({
    title,
    description,
    options: {
      chart: { type, height: 340 },
      title: { text: title },
      xAxis: { categories: baseCategories },
      yAxis: { title: { text: 'Value' } },
      series: [
        { name: 'Alpha', type, data: baseValues },
        { name: 'Beta', type, data: peerValues }
      ]
    }
  });

  return [
    basic('Line chart', 'line', 'Default Highcharts line chart through React state.'),
    basic('Spline chart', 'spline', 'Smooth line chart with regular categories.'),
    basic('Area chart', 'area', 'Filled area series for volume-like data.'),
    basic('Areaspline chart', 'areaspline', 'Smooth filled area series.'),
    basic('Column chart', 'column', 'Vertical columns for category comparison.'),
    basic('Bar chart', 'bar', 'Horizontal bars for compact comparisons.'),
    {
      title: 'Stacked column',
      description: 'Column stacking using native plotOptions.',
      options: {
        chart: { type: 'column', height: 340 },
        title: { text: 'Stacked column' },
        xAxis: { categories: ['North', 'South', 'East', 'West'] },
        yAxis: { min: 0, title: { text: 'Total' }, stackLabels: { enabled: true } },
        plotOptions: { column: { stacking: 'normal' } },
        series: [
          { name: 'Open', type: 'column', data: [5, 3, 4, 7] },
          { name: 'Closed', type: 'column', data: [2, 2, 3, 2] },
          { name: 'Pending', type: 'column', data: [3, 4, 4, 2] }
        ]
      }
    },
    {
      title: 'Pie chart',
      description: 'Simple proportional breakdown.',
      options: {
        chart: { type: 'pie', height: 340 },
        title: { text: 'Pie chart' },
        series: [{ type: 'pie', name: 'Share', data: [['Brazil', 32], ['Canada', 24], ['Portugal', 18], ['United States', 26]] }]
      }
    },
    {
      title: 'Donut chart',
      description: 'Pie chart using innerSize for a donut layout.',
      options: {
        chart: { type: 'pie', height: 340 },
        title: { text: 'Donut chart' },
        plotOptions: { pie: { innerSize: '55%' } },
        series: [{ type: 'pie', name: 'Share', data: [['Frontend', 36], ['Backend', 28], ['Data', 18], ['Ops', 18]] }]
      }
    },
    {
      title: 'Scatter chart',
      description: 'XY points using a scatter series.',
      options: {
        chart: { type: 'scatter', height: 340 },
        title: { text: 'Scatter chart' },
        xAxis: { title: { text: 'X' } },
        yAxis: { title: { text: 'Y' } },
        series: [{ type: 'scatter', name: 'Samples', data: scatterData }]
      }
    },
    {
      title: 'Bubble chart',
      description: 'Three-dimensional points rendered as bubbles.',
      requiresModules: true,
      options: {
        chart: { type: 'bubble', height: 340 },
        title: { text: 'Bubble chart' },
        xAxis: { title: { text: 'Score' } },
        yAxis: { title: { text: 'Volume' } },
        series: [{ type: 'bubble', name: 'Accounts', data: bubbleData }]
      }
    },
    {
      title: 'Combination chart',
      description: 'Columns, spline, and pie together in one Highcharts options object.',
      options: {
        title: { text: 'Combination chart' },
        xAxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
        yAxis: { title: { text: 'Value' } },
        series: [
          { type: 'column', name: 'Revenue', data: [42, 58, 64, 79] },
          { type: 'spline', name: 'Trend', data: [38, 51, 66, 82] },
          { type: 'pie', name: 'Mix', data: [{ name: 'A', y: 45 }, { name: 'B', y: 55 }], center: [90, 60], size: 80, showInLegend: false, dataLabels: { enabled: false } }
        ]
      }
    },
    {
      title: 'Polar chart',
      description: 'Radar-style category comparison.',
      requiresModules: true,
      options: {
        chart: { polar: true, type: 'line', height: 340 },
        title: { text: 'Polar chart' },
        xAxis: { categories: ['Speed', 'Reliability', 'Cost', 'Reach', 'Support'], tickmarkPlacement: 'on', lineWidth: 0 },
        yAxis: { gridLineInterpolation: 'polygon', min: 0 },
        series: [{ type: 'line', name: 'Score', data: [82, 74, 91, 68, 79], pointPlacement: 'on' }]
      }
    },
    {
      title: 'Gauge chart',
      description: 'Classic gauge rendered by highcharts-more.',
      requiresModules: true,
      options: {
        chart: { type: 'gauge', height: 340 },
        title: { text: 'Gauge chart' },
        pane: { startAngle: -150, endAngle: 150 },
        yAxis: { min: 0, max: 100, title: { text: 'Health' } },
        series: [{ type: 'gauge', name: 'Health', data: [74] }]
      }
    },
    {
      title: 'Solid gauge',
      description: 'Compact radial progress through solid-gauge.',
      requiresModules: true,
      options: {
        chart: { type: 'solidgauge', height: 340 },
        title: { text: 'Solid gauge' },
        pane: { center: ['50%', '70%'], size: '100%', startAngle: -90, endAngle: 90, background: { innerRadius: '60%', outerRadius: '100%', shape: 'arc' } },
        yAxis: { min: 0, max: 100, stops: [[0.5, '#d26a2a'], [0.8, '#30a46c']], lineWidth: 0, tickWidth: 0, labels: { enabled: false } },
        series: [{ type: 'solidgauge', name: 'Score', data: [82] }]
      }
    },
    {
      title: 'Heatmap',
      description: 'Color axis data using the heatmap module.',
      requiresModules: true,
      options: makeColorAxisOptions(() => undefined)
    },
    {
      title: 'Treemap',
      description: 'Hierarchical rectangles sized by value.',
      requiresModules: true,
      options: {
        chart: { height: 340 },
        title: { text: 'Treemap' },
        series: [{ type: 'treemap', layoutAlgorithm: 'squarified', data: [
          { name: 'Platform', value: 6, color: '#0d5c9e' },
          { name: 'Commerce', value: 4, color: '#30a46c' },
          { name: 'Data', value: 3, color: '#d26a2a' },
          { name: 'Support', value: 2, color: '#6d52b5' }
        ] }]
      }
    },
    {
      title: 'Funnel',
      description: 'Conversion pipeline with narrowing stages.',
      requiresModules: true,
      options: {
        chart: { type: 'funnel', height: 340 },
        title: { text: 'Funnel' },
        series: [{ type: 'funnel', name: 'Users', data: [['Visits', 1200], ['Trials', 680], ['Demos', 320], ['Customers', 160]] }]
      }
    },
    {
      title: '3D column',
      description: 'Column chart with 3D depth enabled.',
      requiresModules: true,
      options: makeModuleOptions(true)
    },
    {
      title: 'StockChart',
      description: 'Stock constructor with navigator and range selector.',
      stock: true,
      requiresModules: true,
      options: makeStockOptions()
    },
    {
      title: 'Map-like scatter',
      description: 'Map-style coordinate plotting without external map assets.',
      options: {
        chart: { type: 'scatter', height: 340 },
        title: { text: 'Map-like scatter' },
        xAxis: { min: -80, max: 20, title: { text: 'Longitude' } },
        yAxis: { min: -40, max: 60, title: { text: 'Latitude' } },
        series: [{ type: 'scatter', name: 'Cities', data: [[-46.6, -23.5], [-74, 40.7], [-9.1, 38.7], [-0.1, 51.5]] }]
      }
    },
    {
      title: 'No-data chart',
      description: 'The no-data module keeps an empty state visible.',
      requiresModules: true,
      options: { title: { text: 'No-data chart' }, series: [] }
    },
    makeMatrixOnly('Sankey', 'Weighted paths between stages.', { type: 'sankey', keys: ['from', 'to', 'weight'], data: [['Lead', 'Trial', 5], ['Trial', 'Customer', 3], ['Trial', 'Lost', 2]] }),
    makeMatrixOnly('Network graph', 'Linked nodes with force-directed layout.', { type: 'networkgraph', data: [['API', 'Auth'], ['API', 'Search'], ['Search', 'Index'], ['Auth', 'Users']] }),
    makeMatrixOnly('Sunburst', 'Radial hierarchy from parent-child nodes.', { type: 'sunburst', data: [{ id: '0.0', parent: '', name: 'Root' }, { id: '1.1', parent: '0.0', name: 'UI', value: 3 }, { id: '1.2', parent: '0.0', name: 'API', value: 4 }, { id: '1.3', parent: '0.0', name: 'Data', value: 2 }] }),
    makeMatrixOnly('Wordcloud', 'Word weights rendered as a cloud.', { type: 'wordcloud', data: [{ name: 'React', weight: 8 }, { name: 'Highcharts', weight: 7 }, { name: 'TypeScript', weight: 6 }, { name: 'Wrapper', weight: 5 }] }),
    {
      title: 'Variwide',
      description: 'Columns with variable width and value.',
      requiresModules: true,
      options: {
        chart: { type: 'variwide', height: 340 },
        title: { text: 'Variwide' },
        xAxis: { type: 'category' },
        series: [{ type: 'variwide', name: 'Output', data: [['A', 10, 6], ['B', 18, 10], ['C', 8, 4], ['D', 14, 7]] }]
      }
    },
    makeMatrixOnly('Variable pie', 'Pie slices with value and radius.', { type: 'variablepie', minPointSize: 40, innerSize: '25%', zMin: 0, data: [{ name: 'A', y: 30, z: 55 }, { name: 'B', y: 20, z: 35 }, { name: 'C', y: 15, z: 22 }] }),
    makeMatrixOnly('Item series', 'Repeated symbols arranged into item blocks.', { type: 'item', name: 'Votes', data: [{ name: 'A', y: 4, color: '#0d5c9e' }, { name: 'B', y: 3, color: '#30a46c' }, { name: 'C', y: 2, color: '#d26a2a' }] }),
    makeMatrixOnly('Streamgraph', 'Flowing stacked series over time.', { type: 'streamgraph', data: baseValues, name: 'Alpha' }),
    {
      title: 'Dumbbell',
      description: 'Low/high ranges with connected endpoints.',
      requiresModules: true,
      options: { chart: { type: 'dumbbell', height: 340 }, title: { text: 'Dumbbell' }, xAxis: { categories: ['A', 'B', 'C'] }, series: [{ type: 'dumbbell', name: 'Range', data: [[3, 8], [4, 9], [2, 7]] }] }
    },
    makeMatrixOnly('Lollipop', 'Marker-forward column variation.', { type: 'lollipop', data: baseValues, name: 'Score' }),
    {
      title: 'Pareto',
      description: 'Pareto line calculated from a base column series.',
      requiresModules: true,
      options: { chart: { height: 340 }, title: { text: 'Pareto' }, xAxis: { categories: ['A', 'B', 'C', 'D'] }, series: [{ type: 'column', id: 'base', data: [6, 4, 3, 2] }, { type: 'pareto', baseSeries: 'base', name: 'Pareto' }] }
    },
    {
      title: 'Histogram and bell curve',
      description: 'Derived distribution series from a base sample.',
      requiresModules: true,
      options: { title: { text: 'Histogram and bell curve' }, xAxis: [{ title: { text: 'Data' } }, { title: { text: 'Histogram' }, opposite: true }], yAxis: [{ title: { text: 'Data' } }, { title: { text: 'Histogram' }, opposite: true }], series: [{ type: 'scatter', id: 'sample', data: [3, 4, 5, 5, 6, 7, 8, 8, 9, 10], visible: false }, { type: 'histogram', baseSeries: 'sample', yAxis: 1 }, { type: 'bellcurve', baseSeries: 'sample', yAxis: 1 }] }
    },
    makeMatrixOnly('Tilemap', 'Tile grid cells colored by value.', { type: 'tilemap', data: [[0, 0, 1], [1, 0, 2], [2, 0, 3], [0, 1, 4], [1, 1, 5], [2, 1, 6]] }),
    makeMatrixOnly('Arc diagram', 'Relationship flows as arcs.', { type: 'arcdiagram', keys: ['from', 'to', 'weight'], data: [['A', 'B', 3], ['B', 'C', 2], ['A', 'D', 1]] }),
    makeMatrixOnly('Cylinder', '3D cylinder columns.', { type: 'cylinder', data: [4, 7, 5, 9], name: 'Units' }),
    makeMatrixOnly('Funnel 3D', '3D funnel series.', { type: 'funnel3d', data: [['Visits', 8], ['Trials', 5], ['Customers', 2]] }),
    makeMatrixOnly('Pyramid 3D', '3D pyramid series.', { type: 'pyramid3d', data: [['Core', 8], ['Growth', 5], ['New', 2]] }),
    makeMatrixOnly('Dot plot', 'Dot plot for categorical counts.', { type: 'dotplot', data: [4, 6, 3, 8], name: 'Count' }),
    makeMatrixOnly('Packed bubble', 'Packed bubble using highcharts-more.', { type: 'packedbubble', data: [{ name: 'A', value: 10 }, { name: 'B', value: 7 }, { name: 'C', value: 5 }] }),
    {
      title: 'Parallel coordinates',
      description: 'Multiple dimensions compared across rows.',
      requiresModules: true,
      options: {
        chart: { parallelCoordinates: true, type: 'line', height: 340 },
        title: { text: 'Parallel coordinates' },
        xAxis: { categories: ['Velocity', 'Quality', 'Risk', 'Coverage', 'Adoption'] },
        yAxis: { title: { text: null }, min: 0, max: 10 },
        series: [
          { type: 'line', name: 'Release A', data: [8, 7, 3, 6, 8] },
          { type: 'line', name: 'Release B', data: [6, 9, 2, 8, 7] },
          { type: 'line', name: 'Release C', data: [9, 6, 5, 5, 9] }
        ]
      }
    },
    { title: 'Heikin Ashi', description: 'Stock transformation of OHLC data.', stock: true, requiresModules: true, options: { title: { text: 'Heikin Ashi' }, series: [{ type: 'heikinashi', data: makeOhlcSample() }] } },
    { title: 'Hollow candlestick', description: 'Hollow candle stock rendering.', stock: true, requiresModules: true, options: { title: { text: 'Hollow candlestick' }, series: [{ type: 'hollowcandlestick', data: makeOhlcSample() }] } },
    makeMatrixOnly('Vector', 'Vector arrows from x/y/direction/length tuples.', { type: 'vector', data: [[0, 0, 45, 4], [1, 1, 90, 5], [2, 0, 135, 3]] }),
    makeMatrixOnly('Wind barb', 'Wind barb glyphs from speed and direction.', { type: 'windbarb', data: [[0, 5, 45], [1, 7, 90], [2, 4, 135]] }),
    makeMatrixOnly('Treegraph', 'Hierarchy tree with connectors.', makeTreegraphOptions().series[0]),
    makeMatrixOnly('Flowmap', 'Flow links between coordinate nodes.', { type: 'flowmap', keys: ['from', 'to', 'weight'], data: [['BR', 'CA', 2], ['BR', 'US', 4]], nodes: [{ id: 'BR', lon: -46, lat: -23 }, { id: 'CA', lon: -79, lat: 43 }, { id: 'US', lon: -74, lat: 40 }] }),
    makeMatrixOnly('Geo heatmap', 'Geographic heat cells by coordinate.', { type: 'geoheatmap', data: [[-46, -23, 4], [-79, 43, 3], [-9, 38, 2]] }),
    makeMatrixOnly('Pictorial', 'Pictorial bars using SVG path shapes.', { type: 'pictorial', data: [4, 7, 5], paths: [{ definition: 'M 0 10 L 10 10 L 10 0 L 0 0 Z' }] }),
    makeMatrixOnly('Contour', 'Contour surface from x/y/z tuples.', { type: 'contour', data: [[0, 0, 1], [1, 0, 3], [2, 0, 2], [0, 1, 2], [1, 1, 5], [2, 1, 4], [0, 2, 1], [1, 2, 3], [2, 2, 2]] }),
    { title: 'Renko', description: 'Renko StockChart price bricks.', stock: true, requiresModules: true, options: makeRenkoOptions() },
    { title: 'Point and figure', description: 'Point and figure StockChart columns.', stock: true, requiresModules: true, options: makePointAndFigureOptions() }
  ];
}

function makeMatrixOnly(title: string, description: string, series: any): MatrixExample {
  return {
    title,
    description,
    requiresModules: true,
    options: {
      chart: { height: 340 },
      title: { text: title },
      series: [series]
    }
  };
}

function makeOhlcSample() {
  return [
    [Date.UTC(2024, 0, 1), 100, 108, 96, 104],
    [Date.UTC(2024, 0, 2), 104, 111, 101, 109],
    [Date.UTC(2024, 0, 3), 109, 115, 106, 111],
    [Date.UTC(2024, 0, 4), 111, 114, 104, 106],
    [Date.UTC(2024, 0, 5), 106, 112, 102, 110],
    [Date.UTC(2024, 0, 8), 110, 119, 108, 116]
  ];
}

function formatPrice(value: number) {
  if (!Number.isFinite(value)) {
    return '-';
  }

  if (value >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  if (value >= 10) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function createFallbackCandles(): { ohlc: CandlePoint[]; volume: VolumePoint[] } {
  const ohlc: CandlePoint[] = [];
  const volume: VolumePoint[] = [];
  let close = 632;
  const start = Date.now() - 120 * 1000;

  for (let index = 0; index < 120; index += 1) {
    const time = start + index * 1000;
    const open = close;
    close = open + Math.sin(index / 8) * 0.18 + (index % 9 === 0 ? 0.34 : -0.03);
    const high = Math.max(open, close) + 0.18 + Math.random() * 0.1;
    const low = Math.min(open, close) - 0.18 - Math.random() * 0.1;
    const point: CandlePoint = [
      time,
      Number(open.toFixed(4)),
      Number(high.toFixed(4)),
      Number(low.toFixed(4)),
      Number(close.toFixed(4))
    ];

    ohlc.push(point);
    volume.push({
      x: time,
      y: Math.round(120 + Math.abs(close - open) * 1200 + Math.random() * 160),
      color: close >= open ? '#02c076' : '#f6465d'
    });
  }

  return { ohlc, volume };
}

function normalizeKline(row: any[]): { candle: CandlePoint; volume: VolumePoint } | null {
  if (!Array.isArray(row) || row.length < 6) {
    return null;
  }

  const candle: CandlePoint = [
    Number(row[0]),
    Number(row[1]),
    Number(row[2]),
    Number(row[3]),
    Number(row[4])
  ];

  if (candle.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    candle,
    volume: {
      x: candle[0],
      y: Number(row[5]),
      color: candle[4] >= candle[1] ? '#02c076' : '#f6465d'
    }
  };
}

function candleMeta(candle: CandlePoint | null) {
  if (!candle) {
    return null;
  }

  const changePercent = candle[1] ? ((candle[4] - candle[1]) / candle[1]) * 100 : 0;

  return {
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    changePercent
  };
}

function calculateMovingAverage(data: CandlePoint[], period: number) {
  const result: Array<[number, number]> = [];
  let sum = 0;

  for (let index = 0; index < data.length; index += 1) {
    sum += data[index][4];

    if (index >= period) {
      sum -= data[index - period][4];
    }

    if (index >= period - 1) {
      result.push([data[index][0], Number((sum / period).toFixed(6))]);
    }
  }

  return result;
}

function upsertTimePoint<T extends { x?: number } | any[]>(rows: T[], next: T, limit = 300) {
  const nextTime = Array.isArray(next) ? Number(next[0]) : Number(next.x);
  const last = rows[rows.length - 1];
  const lastTime = Array.isArray(last) ? Number(last[0]) : Number(last?.x);

  if (Number.isFinite(lastTime) && lastTime === nextTime) {
    rows[rows.length - 1] = next;
  } else {
    rows.push(next);
  }

  while (rows.length > limit) {
    rows.shift();
  }

  return rows.slice();
}

function createCandleOptions(theme: 'dark' | 'light', symbol: string, interval: string, ohlc: CandlePoint[], volume: VolumePoint[]) {
  const isLight = theme === 'light';
  const lineColor = isLight ? '#e6eef5' : '#1c2633';
  const textColor = isLight ? '#344054' : '#d8dee9';
  const background = isLight ? '#fff' : '#050505';
  const candleData = ohlc.length ? ohlc : createFallbackCandles().ohlc;
  const volumeData = volume.length ? volume : createFallbackCandles().volume;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 760;

  return {
    chart: {
      backgroundColor: background,
      height: isMobile ? 440 : 560,
      spacing: isMobile ? [8, 8, 8, 8] : [14, 14, 14, 14]
    },
    rangeSelector: { enabled: false },
    navigator: { enabled: false },
    scrollbar: { enabled: false },
    title: {
      text: isMobile ? '' : `${symbol} live candles`,
      align: 'left',
      style: { color: textColor, fontWeight: '700' }
    },
    subtitle: {
      text: isMobile ? '' : `Live candle updates (${interval})`,
      align: 'left',
      style: { color: textColor }
    },
    legend: { enabled: !isMobile, itemStyle: { color: textColor } },
    credits: { enabled: false },
    xAxis: {
      type: 'datetime',
      lineColor,
      tickColor: lineColor,
      labels: { style: { color: textColor } }
    },
    yAxis: [
      {
        height: '70%',
        gridLineColor: lineColor,
        labels: { align: 'right', x: -4, style: { color: textColor } },
        title: { text: null }
      },
      {
        top: '74%',
        height: '26%',
        offset: 0,
        gridLineColor: lineColor,
        labels: { align: 'right', x: -4, style: { color: textColor } },
        title: { text: 'Volume', style: { color: textColor } }
      }
    ],
    tooltip: {
      shared: true,
      split: false,
      backgroundColor: isLight ? '#fff' : '#101828',
      borderColor: isLight ? '#d0d5dd' : '#344054',
      style: { color: isLight ? '#101828' : '#f8fafc' }
    },
    plotOptions: {
      series: {
        animation: false,
        states: { inactive: { opacity: 1 } }
      },
      candlestick: {
        color: '#f6465d',
        upColor: '#02c076',
        lineColor: '#f6465d',
        upLineColor: '#02c076'
      }
    },
    series: [
      { type: 'candlestick', name: symbol, data: candleData, yAxis: 0 },
      { type: 'line', name: 'MA 7', data: calculateMovingAverage(candleData, 7), color: '#f0b90b', yAxis: 0, marker: { enabled: false } },
      { type: 'line', name: 'MA 25', data: calculateMovingAverage(candleData, 25), color: '#ff5ec4', yAxis: 0, marker: { enabled: false } },
      { type: 'line', name: 'MA 99', data: calculateMovingAverage(candleData, 99), color: '#9b5de5', yAxis: 0, marker: { enabled: false } },
      { type: 'column', name: 'Volume', data: volumeData, yAxis: 1, borderWidth: 0, pointPadding: 0.04, groupPadding: 0.02 }
    ]
  } as any;
}

function normalizeMarketRow(input: any): MarketRow | null {
  const symbol = String(input.symbol || input.s || '');

  if (!symbol) {
    return null;
  }

  const previousClose = Number(input.prevClosePrice || input.o || input.openPrice || input.c || 0);
  const price = Number(input.lastPrice || input.c || input.price || previousClose || 0);
  const high = Number(input.highPrice || input.h || price);
  const low = Number(input.lowPrice || input.l || price);
  const changePercent = Number(input.priceChangePercent || (previousClose ? ((price - previousClose) / previousClose) * 100 : 0));

  return {
    symbol,
    name: symbol.replace('USDT', ''),
    price,
    changePercent,
    quoteVolume: Number(input.quoteVolume || input.q || input.v || 0),
    baseVolume: Number(input.volume || input.v || 0),
    trades: Number(input.count || input.n || 0),
    high,
    low
  };
}

function toFiniteNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeTreemapText(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeCoinGeckoCoin(coin: any): CryptoTreemapRow {
  return {
    name: safeTreemapText(coin?.name || ''),
    symbol: safeTreemapText(String(coin?.symbol || '').toUpperCase()),
    price: toFiniteNumber(coin?.current_price, 0),
    marketCap: toFiniteNumber(coin?.market_cap, 0),
    changePercent: toFiniteNumber(coin?.price_change_percentage_24h, 0)
  };
}

function mergeMarketRows(current: MarketRow[], next: MarketRow) {
  const rows = current.length ? current.slice() : FALLBACK_MARKETS.slice();
  const index = rows.findIndex((row) => row.symbol === next.symbol);

  if (index >= 0) {
    rows[index] = { ...rows[index], ...next };
  } else {
    rows.push(next);
  }

  return rows;
}

function marketRowsForChart(rows: MarketRow[]) {
  const baseRows = rows.length ? rows : FALLBACK_MARKETS;

  if (baseRows.length >= 50) {
    return baseRows;
  }

  const expanded = baseRows.slice();

  for (let index = 0; expanded.length < 50; index += 1) {
    const source = baseRows[index % baseRows.length];
    const symbol = FALLBACK_MARKET_SYMBOLS[index % FALLBACK_MARKET_SYMBOLS.length];
    const scale = Math.max(0.08, 0.92 - index * 0.018);

    expanded.push({
      symbol: `${symbol}USDT`,
      name: symbol,
      price: Math.max(0.01, source.price * scale / (index + 2)),
      changePercent: Number((Math.sin(index / 3) * 4.8).toFixed(2)),
      quoteVolume: Math.max(12000000, source.quoteVolume * scale / (index + 1.4)),
      baseVolume: Math.max(1000000, source.baseVolume * scale),
      trades: Math.max(12000, Math.round(source.trades * scale)),
      high: source.high * scale,
      low: source.low * scale
    });
  }

  return expanded;
}

function marketCategories(rows: MarketRow[]) {
  return marketRowsForChart(rows).map((row) => row.name);
}

function cryptoTreemapRowsForChart(rows: CryptoTreemapRow[]) {
  return (rows.length ? rows : FALLBACK_TREEMAP_COINS)
    .filter((row) => row.marketCap > 0)
    .slice()
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, 50);
}

function marketColor(value: number) {
  if (value > 1.5) {
    return '#48d94b';
  }

  if (value > 0) {
    return '#cfe8d6';
  }

  if (value < -1.5) {
    return '#fb5d57';
  }

  if (value < 0) {
    return '#eec1c1';
  }

  return '#dfe5e8';
}

function marketValues(rows: MarketRow[], key: keyof MarketRow, divisor = 1) {
  return rows.map((row) => Number((Number(row[key] || 0) / divisor).toFixed(2)));
}

function marketPieData(rows: MarketRow[]) {
  return rows.map((row) => [
    row.name,
    Number((row.quoteVolume / 1000000).toFixed(2))
  ]);
}

function sortedMarketRowsBy(rows: MarketRow[], key: keyof MarketRow) {
  return rows.slice().sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0));
}

function maxField(rows: MarketRow[], key: keyof MarketRow) {
  return Math.max(...rows.map((row) => Number(row[key] || 0)), 1);
}

function metricScore(value: number, min: number, max: number) {
  if (max <= min) {
    return 0;
  }

  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function rangePercent(row: MarketRow) {
  const base = Math.max(row.price || row.low || 1, 1);
  return ((row.high - row.low) / base) * 100;
}

const MARKET_POINT_COORDS = [
  { lon: -46.6333, lat: -23.5505 },
  { lon: -74.006, lat: 40.7128 },
  { lon: -0.1276, lat: 51.5072 },
  { lon: 2.3522, lat: 48.8566 },
  { lon: -99.1332, lat: 19.4326 },
  { lon: -70.6693, lat: -33.4489 },
  { lon: -58.3816, lat: -34.6037 },
  { lon: -79.3832, lat: 43.6532 }
];

function modernMarketPoints(rows: MarketRow[]) {
  return rows.map((row, index) => ({
    id: row.symbol,
    name: row.name,
    lon: MARKET_POINT_COORDS[index % MARKET_POINT_COORDS.length].lon,
    lat: MARKET_POINT_COORDS[index % MARKET_POINT_COORDS.length].lat,
    value: row.changePercent,
    quoteVolume: row.quoteVolume
  }));
}

function makeDynamicTutorialHtml(optionName: string) {
  return `<Chart\n  highcharts={Highcharts}\n  options={${optionName}}\n/>`;
}

function makeDynamicTutorialTs(optionName: string) {
  return `const ${optionName} = createOptionsFromLiveData({\n  marketRows,\n  candleRows,\n  selectedSymbol,\n  selectedInterval\n});`;
}

function makeDynamicTutorialScss(height = 340) {
  return `.chart-frame {\n  min-height: ${height}px;\n}\n\n.chart-host {\n  display: block;\n  width: 100%;\n}`;
}

function makeDynamicExample(
  title: string,
  description: string,
  optionName: string,
  options: any,
  constructorType?: 'chart' | 'stockChart',
  settings: Pick<DynamicExample, 'allowChartUpdate'> = {}
): DynamicExample {
  return {
    title,
    description,
    options,
    constructorType,
    ...settings,
    tutorialHtml: makeDynamicTutorialHtml(optionName),
    tutorialTs: makeDynamicTutorialTs(optionName),
    tutorialScss: makeDynamicTutorialScss(options?.chart?.height || 340)
  };
}

function createTreemapOptions(rows: CryptoTreemapRow[], status: string) {
  const data = cryptoTreemapRowsForChart(rows)
    .map((row) => ({
      name: row.symbol,
      value: row.marketCap,
      colorValue: Number(row.changePercent.toFixed(2)),
      custom: {
        name: row.name,
        symbol: row.symbol,
        change: Number(row.changePercent.toFixed(2)),
        price: formatPrice(row.price),
        marketCap: row.marketCap
      }
    }));

  return {
    chart: {
      type: 'treemap',
      className: 'crypto-treemap-chart',
      height: 620,
      backgroundColor: '#ffffff',
      plotBackgroundColor: '#ffffff',
      spacing: [12, 0, 8, 0],
      events: {
        load(this: any) {
          const chart = this;
          const hideTooltip = () => {
            chart.tooltip?.hide?.(0);
          };
          const hideWhenOutside = (event: Event) => {
            const target = event.target as Node | null;

            if (chart.container?.contains?.(target)) {
              return;
            }

            hideTooltip();
          };

          chart.container?.addEventListener?.('mouseleave', hideTooltip);
          chart.container?.addEventListener?.('blur', hideTooltip, true);
          document.addEventListener('mousedown', hideWhenOutside, true);
          document.addEventListener('touchstart', hideWhenOutside, true);
          document.addEventListener('scroll', hideTooltip, true);
          window.addEventListener('blur', hideTooltip);
        }
      }
    },
    title: {
      text: 'Top 50 coins by market cap',
      style: { color: '#111827', fontSize: '22px', fontWeight: '700' }
    },
    subtitle: {
      text: `${status} | colored by 24h change`,
      style: { color: '#475569', fontSize: '14px' }
    },
    credits: { enabled: false },
    colorAxis: {
      min: -10,
      max: 10,
      stops: [[0, '#f33b36'], [0.45, '#fb7b72'], [0.5, '#e5e7eb'], [0.55, '#82e77c'], [1, '#29b916']]
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#cbd5e1',
      hideDelay: 0,
      shadow: true,
      zIndex: 100000,
      style: { color: '#111827' },
      headerFormat: '',
      pointFormat: '<b>{point.custom.name} ({point.custom.symbol})</b><br/>Market cap: ${point.custom.marketCap:,.0f}<br/>Price: ${point.custom.price}<br/>24h change: {point.custom.change:.2f}%'
    },
    plotOptions: {
      treemap: {
        animation: false,
        borderColor: '#fff',
        borderWidth: 2,
        stickyTracking: false,
        point: {
          events: {
            mouseOver(this: any) {
              const chart = this.series?.chart;

              if (chart?.tooltip?.label?.toFront) {
                setTimeout(() => chart.tooltip.label.toFront(), 0);
              }
            },
            mouseOut(this: any) {
              this.series?.chart?.tooltip?.hide?.(0);
            }
          }
        },
        dataLabels: {
          enabled: true,
          crop: true,
          overflow: 'none',
          align: 'center',
          verticalAlign: 'middle',
          style: {
            color: '#030712',
            fontSize: '13px',
            fontWeight: '700',
            textOutline: 'none'
          },
          formatter(this: any) {
            const point = this.point || {};
            const custom = point.custom || {};
            const shape = point.shapeArgs || {};
            const width = shape.width || 0;
            const height = shape.height || 0;
            const change = Number(custom.change || 0);
            const sign = change > 0 ? '+' : '';

            if (width < 42 || height < 28) {
              return point.name;
            }

            if (width > 220 && height > 150) {
              return `${custom.name} (${point.name})<br/>$${custom.price}<br/>${sign}${change.toFixed(2)}%`;
            }

            if (width > 110 && height > 72) {
              return `${point.name}<br/>$${custom.price}<br/>${sign}${change.toFixed(2)}%`;
            }

            return `${point.name}<br/>${sign}${change.toFixed(1)}%`;
          }
        }
      }
    },
    series: [{
      type: 'treemap',
      layoutAlgorithm: 'squarified',
      alternateStartingDirection: true,
      turboThreshold: 0,
      data
    }]
  } as any;
}

function createDynamicMarketExamples(rows: MarketRow[], candles: CandlePoint[], volume: VolumePoint[], symbol: string, interval: string, treemapRows: CryptoTreemapRow[], treemapStatus: string) {
  const source = rows.length ? rows : FALLBACK_MARKETS;
  const categories = source.map((row) => row.name);
  const quoteVolume = source.map((row) => Math.round(row.quoteVolume / 1000000));
  const changes = source.map((row) => Number(row.changePercent.toFixed(2)));
  const prices = source.map((row) => Number(row.price.toFixed(row.price >= 10 ? 2 : 5)));
  const candleRows = candles.length ? candles.slice(-80) : createFallbackCandles().ohlc.slice(-80);
  const pulse = candleRows.map((point, index) => [point[0], Number((((point[4] - point[1]) / point[1]) * 100 + Math.sin(index / 3) * 0.8).toFixed(4))]);
  const closeSeries = candleRows.map((point) => [point[0], point[4]]);
  const closeValues = candleRows.map((point) => point[4]);
  const closeRange = Math.max(...closeValues) - Math.min(...closeValues);
  const renkoBoxSize = Number(Math.max(0.01, closeRange / 18).toFixed(4));
  const renkoCloseSeries = candleRows.map((point, index) => ({ x: index, y: point[4] }));
  const pointAndFigureCloseSeries = candleRows.map((point) => ({ x: point[0], y: point[4] }));
  const volumeSeries = volume.length ? volume.slice(-80).map((point) => [point.x, point.y]) : createFallbackCandles().volume.slice(-80).map((point) => [point.x, point.y]);
  const score = Math.max(0, Math.min(100, 50 + changes.reduce((sum, value) => sum + value, 0) * 2));
  const volumeShareRows = source.slice().sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, 8);
  const volumeShareMax = Math.max(...volumeShareRows.map((row) => row.quoteVolume), 1);
  const volumeShareData = volumeShareRows.map((row) => [row.name, Math.max(1, Math.round(row.quoteVolume / volumeShareMax * 100))]);
  const bubbleRows = volumeShareRows.slice();
  const bubbleMaxVolume = Math.max(...bubbleRows.map((row) => row.quoteVolume / 100000000), 1);
  const topVolumeRows = volumeShareRows.slice();
  const packedRows = sortedMarketRowsBy(marketRowsForChart(source), 'quoteVolume').slice(0, 18);
  const packedMaxVolume = maxField(packedRows, 'quoteVolume');
  const packedPoint = (row: MarketRow) => ({
    name: row.name,
    value: Number((30 + Math.sqrt(row.quoteVolume / packedMaxVolume) * 90).toFixed(2)),
    custom: {
      symbol: row.symbol,
      quoteVolume: row.quoteVolume,
      changePercent: row.changePercent
    }
  });
  const topSixByVolume = sortedMarketRowsBy(source, 'quoteVolume').slice(0, 6);
  const topSixByTrades = sortedMarketRowsBy(source, 'trades').slice(0, 6);
  const maxVolume = maxField(source, 'quoteVolume');
  const maxTrades = maxField(source, 'trades');
  const marketPoints = modernMarketPoints(source);
  const flowHub = { id: 'STACKLINE-HUB', name: 'Stackline liquidity hub', lon: -38.5, lat: 8.5 };

  return [
    makeDynamicExample('Live crypto treemap', 'Top 50 coins sized by market cap and colored by 24h change.', 'liveTreemapOptions', createTreemapOptions(treemapRows, treemapStatus)),
    makeDynamicExample('Live price move line', 'Normalized live price movement from Binance miniTicker WebSocket.', 'liveLineOptions', {
      chart: { type: 'line', height: 340 },
      title: { text: 'Live price move line' },
      xAxis: { categories },
      yAxis: { title: { text: '24h change %' } },
      series: [{ type: 'line', name: 'Change %', data: changes }]
    }),
    makeDynamicExample('Live price heartbeat spline', 'Heartbeat-style normalized pulse from live price and change data.', 'liveSplineOptions', {
      chart: { type: 'spline', height: 340 },
      title: { text: 'Live price heartbeat spline' },
      xAxis: { type: 'datetime' },
      yAxis: { title: { text: 'Pulse' } },
      series: [{ type: 'spline', name: `${symbol} pulse`, data: pulse, color: '#146c94' }]
    }),
    makeDynamicExample('Live quote volume area', 'Area comparison using live quote volume.', 'liveAreaOptions', {
      chart: { type: 'area', height: 340 },
      title: { text: 'Live quote volume area' },
      xAxis: { categories },
      yAxis: { title: { text: 'Quote volume, millions' } },
      series: [{ type: 'area', name: 'Quote volume', data: quoteVolume }]
    }),
    makeDynamicExample('Live quote volume areaspline', 'Smooth area chart from live quote volume.', 'liveAreasplineOptions', {
      chart: { type: 'areaspline', height: 340 },
      title: { text: 'Live quote volume areaspline' },
      xAxis: { categories },
      yAxis: { title: { text: 'Quote volume, millions' } },
      series: [{ type: 'areaspline', name: 'Quote volume', data: quoteVolume }]
    }),
    makeDynamicExample('Live change column', '24h percentage change updated by WebSocket.', 'liveColumnOptions', {
      chart: { type: 'column', height: 340 },
      title: { text: 'Live change column' },
      xAxis: { categories },
      yAxis: { title: { text: '24h change %' } },
      series: [{ type: 'column', name: 'Change %', data: changes.map((value) => ({ y: value, color: marketColor(value) })) }]
    }),
    makeDynamicExample('Live volume bar', 'Horizontal bar chart from live quote volume.', 'liveBarOptions', {
      chart: { type: 'bar', height: 340 },
      title: { text: 'Live volume bar' },
      xAxis: { categories },
      yAxis: { title: { text: 'Quote volume, millions' } },
      series: [{ type: 'bar', name: 'Quote volume', data: quoteVolume }]
    }),
    makeDynamicExample('Live stacked volume', 'Stacked columns splitting volume into base and quote-derived views.', 'liveStackedOptions', {
      chart: { type: 'column', height: 340 },
      title: { text: 'Live stacked volume' },
      xAxis: { categories },
      yAxis: { min: 0, title: { text: 'Volume score' }, stackLabels: { enabled: true } },
      plotOptions: { series: { animation: false }, column: { stacking: 'normal' } },
      series: [
        { type: 'column', name: 'Base volume', data: marketValues(source, 'baseVolume', 1000000) },
        { type: 'column', name: 'Quote volume', data: marketValues(source, 'quoteVolume', 100000000) }
      ]
    }),
    makeDynamicExample('Live volume pie', 'Volume share across tracked symbols.', 'livePieOptions', {
      chart: { type: 'pie', height: 340, animation: false },
      title: { text: 'Live volume pie' },
      legend: { align: 'center', verticalAlign: 'bottom' },
      plotOptions: {
        series: { animation: false },
        pie: { center: ['50%', '45%'], dataLabels: { enabled: false }, showInLegend: true }
      },
      series: [{ type: 'pie', name: 'Volume share', size: '62%', data: volumeShareData }]
    }),
    makeDynamicExample('Live volume donut', 'Donut variation of the same live volume share.', 'liveDonutOptions', {
      chart: { type: 'pie', height: 340, animation: false, spacing: [12, 12, 40, 12] },
      title: { text: 'Live volume donut' },
      legend: { align: 'center', verticalAlign: 'bottom' },
      plotOptions: {
        series: { animation: false },
        pie: {
          center: ['50%', '45%'],
          dataLabels: { enabled: false },
          showInLegend: true
        }
      },
      series: [{ type: 'pie', name: 'Volume share', size: '62%', innerSize: '56%', data: volumeShareData }]
    }),
    makeDynamicExample('Live price scatter', 'Price versus quote volume for the tracked symbols.', 'liveScatterOptions', {
      chart: { type: 'scatter', height: 340 },
      title: { text: 'Live price scatter' },
      xAxis: { title: { text: 'Price' } },
      yAxis: { title: { text: 'Quote volume, millions' } },
      series: [{ type: 'scatter', name: 'Markets', data: source.map((row) => ({ x: row.price, y: Math.round(row.quoteVolume / 1000000), name: row.name })) }]
    }),
    makeDynamicExample('Live change bubble', 'Change percent, price and volume in a bubble chart.', 'liveBubbleOptions', {
      chart: { type: 'bubble', height: 340, animation: false, plotBorderWidth: 1, zoomType: 'xy' },
      title: { text: 'Live change bubble' },
      xAxis: { title: { text: '24h change %' } },
      yAxis: { type: 'logarithmic', title: { text: 'Price USDT' } },
      plotOptions: { series: { animation: false } },
      tooltip: {
        pointFormat: '<b>{point.name}</b><br/>Change: {point.x:.2f}%<br/>Price: ${point.y}<br/>Volume score: {point.z:.1f}'
      },
      series: [{
        type: 'bubble',
        name: 'Markets',
        minSize: '6%',
        maxSize: '28%',
        zMin: 0,
        zMax: bubbleMaxVolume,
        data: bubbleRows.map((row) => ({
          x: Number(row.changePercent.toFixed(2)),
          y: Number(row.price.toFixed(row.price >= 10 ? 2 : 5)),
          z: Math.max(1, row.quoteVolume / 100000000),
          name: row.name
        }))
      }]
    }),
    makeDynamicExample('Live combo chart', 'Column volume plus spline change percent.', 'liveComboOptions', {
      chart: { height: 340 },
      title: { text: 'Live combo chart' },
      xAxis: { categories },
      yAxis: [{ title: { text: 'Volume' } }, { title: { text: 'Change %' }, opposite: true }],
      series: [
        { type: 'column', name: 'Volume', data: quoteVolume },
        { type: 'spline', name: 'Change %', yAxis: 1, data: changes }
      ]
    }),
    makeDynamicExample('Live polar strength', 'Market strength rendered in polar/radar form.', 'livePolarOptions', {
      chart: { polar: true, type: 'line', height: 340, animation: false },
      title: { text: 'Live polar strength' },
      pane: { size: '80%' },
      xAxis: { categories, tickmarkPlacement: 'on', lineWidth: 0 },
      yAxis: { gridLineInterpolation: 'polygon', min: 0 },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'line', name: 'Strength', data: changes.map((value) => Math.max(0, 50 + value * 8)) }]
    }),
    makeDynamicExample('Live BNB change gauge', 'Gauge driven by BNBUSDT 24h change.', 'liveGaugeOptions', {
      chart: { type: 'gauge', height: 340, animation: false },
      title: { text: 'Live BNB change gauge' },
      pane: { startAngle: -120, endAngle: 120 },
      yAxis: { min: -10, max: 10, title: { text: 'Change %' } },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'gauge', name: 'BNB change', data: [source.find((row) => row.symbol === 'BNBUSDT')?.changePercent || changes[0] || 0] }]
    }),
    makeDynamicExample('Live market score solid gauge', 'Solid gauge score from the tracked symbols.', 'liveSolidGaugeOptions', {
      chart: { type: 'solidgauge', height: 340, animation: false },
      title: { text: 'Live market score solid gauge' },
      pane: { center: ['50%', '60%'], size: '90%', startAngle: -90, endAngle: 90, background: { innerRadius: '60%', outerRadius: '100%', shape: 'arc' } },
      yAxis: { min: 0, max: 100, lineWidth: 0, tickWidth: 0 },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'solidgauge', name: 'Score', data: [Number(score.toFixed(2))] }]
    }),
    makeDynamicExample('Live market heatmap', 'Heatmap built from change and volatility metrics.', 'liveHeatmapOptions', {
      chart: { type: 'heatmap', height: 340, animation: false },
      title: { text: 'Live market heatmap' },
      xAxis: { categories },
      yAxis: { categories: ['Change', 'Range'], title: null },
      colorAxis: { minColor: '#fb5d57', maxColor: '#48d94b' },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'heatmap', name: 'Markets', data: source.flatMap((row, index) => [[index, 0, row.changePercent], [index, 1, row.high - row.low]]) }]
    }),
    makeDynamicExample('Live liquidity funnel', 'Funnel sorted from highest to lowest quote volume.', 'liveFunnelOptions', {
      chart: { type: 'funnel', height: 340, animation: false },
      title: { text: 'Live liquidity funnel' },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'funnel', name: 'Quote volume', data: source.slice().sort((a, b) => b.quoteVolume - a.quoteVolume).map((row) => [row.name, Math.max(row.quoteVolume, 1)]) }]
    }),
    makeDynamicExample('Live 3D volume columns', '3D columns from live quote volume.', 'live3dColumnOptions', {
      chart: { type: 'column', animation: false, options3d: { enabled: true, alpha: 12, beta: 12, depth: 45 }, height: 340 },
      title: { text: 'Live 3D volume columns' },
      xAxis: { categories: topVolumeRows.map((row) => row.name) },
      yAxis: { title: { text: 'Quote volume, millions' } },
      plotOptions: { series: { animation: false }, column: { depth: 35, pointPadding: 0.08, groupPadding: 0.04 } },
      series: [{ type: 'column', name: 'Volume', data: topVolumeRows.map((row) => Math.round(row.quoteVolume / 1000000)) }]
    }),
    makeDynamicExample('Live volume cylinder', 'Cylinder chart driven by Binance quote volume.', 'liveCylinderOptions', {
      chart: { type: 'cylinder', height: 340, options3d: { enabled: true, alpha: 15, beta: 15, depth: 45, viewDistance: 25 } },
      title: { text: 'Live volume cylinder' },
      xAxis: { categories: topSixByVolume.map((row) => row.name) },
      yAxis: { title: { text: 'Quote volume, millions' } },
      plotOptions: { series: { animation: false, colorByPoint: true }, column: { depth: 35 } },
      series: [{ type: 'cylinder', name: 'Quote volume', data: marketValues(topSixByVolume, 'quoteVolume', 1000000) }]
    }),
    makeDynamicExample('Live liquidity funnel 3D', '3D funnel sorted by Binance quote volume.', 'liveFunnel3dOptions', {
      chart: { type: 'funnel3d', height: 360, options3d: { enabled: true, alpha: 10, depth: 50, viewDistance: 50 } },
      title: { text: 'Live liquidity funnel 3D' },
      plotOptions: {
        series: {
          animation: false,
          neckWidth: '30%',
          neckHeight: '25%',
          width: '72%',
          height: '82%',
          dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.0f}M' }
        }
      },
      series: [{ type: 'funnel3d', name: 'Quote volume', data: marketPieData(topSixByVolume) }]
    }),
    makeDynamicExample('Live trade activity pyramid 3D', '3D pyramid using Binance 24hr trade counts when available.', 'livePyramid3dOptions', {
      chart: { type: 'pyramid3d', height: 360, options3d: { enabled: true, alpha: 10, depth: 50, viewDistance: 50 } },
      title: { text: 'Live trade activity pyramid 3D' },
      subtitle: { text: 'Binance 24hr ticker count, thousands' },
      plotOptions: {
        series: {
          animation: false,
          width: '72%',
          height: '82%',
          dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y:.0f}K' }
        }
      },
      series: [{
        type: 'pyramid3d',
        name: 'Trades',
        data: topSixByTrades.map((row) => [row.name, Math.round((row.trades || 0) / 1000)])
      }]
    }),
    makeDynamicExample('Live change dot plot', 'Dot plot from live 24hr percentage change.', 'liveDotplotOptions', {
      chart: { type: 'dotplot', height: 340 },
      title: { text: 'Live change dot plot' },
      xAxis: { categories },
      yAxis: {
        title: { text: '24h change %' },
        plotLines: [{ value: 0, color: '#94a3b8', width: 1, dashStyle: 'ShortDash', zIndex: 1 }]
      },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'dotplot', name: '24h change', data: changes }]
    }),
    makeDynamicExample('Live liquidity packed bubbles', 'Packed bubble snapshot from the live Binance liquidity rank.', 'livePackedBubbleOptions', {
      chart: { type: 'packedbubble', height: 430, spacing: [18, 18, 18, 18] },
      title: { text: 'Live liquidity packed bubbles' },
      subtitle: { text: 'Bubble size is normalized from quote volume so every group remains readable.' },
      legend: { align: 'center', verticalAlign: 'bottom' },
      tooltip: {
        pointFormat: '<b>{point.name}</b><br/>Liquidity score: {point.value:.1f}<br/>24h change: {point.custom.changePercent:.2f}%'
      },
      plotOptions: {
        packedbubble: {
          animation: false,
          minSize: 40,
          maxSize: 130,
          zMin: 0,
          zMax: 120,
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            allowOverlap: false,
            style: {
              color: '#102033',
              fontSize: '11px',
              fontWeight: '700',
              textOutline: 'none'
            }
          },
          layoutAlgorithm: {
            enableSimulation: false,
            initialPositions: 'circle',
            splitSeries: false,
            bubblePadding: 8,
            gravitationalConstant: 0.08,
            friction: -0.95
          }
        }
      },
      series: [
        { type: 'packedbubble', name: 'Top liquidity', color: '#7fb3d5', data: packedRows.slice(0, 6).map(packedPoint) },
        { type: 'packedbubble', name: 'Core liquidity', color: '#79c8a1', data: packedRows.slice(6, 12).map(packedPoint) },
        { type: 'packedbubble', name: 'Watchlist', color: '#f1a17b', data: packedRows.slice(12, 18).map(packedPoint) }
      ]
    }, undefined, { allowChartUpdate: false }),
    makeDynamicExample('Live market parallel coordinates', 'Parallel coordinates comparing live Binance price, range, volume and trade activity.', 'liveParallelCoordinatesOptions', {
      chart: { parallelCoordinates: true, type: 'line', height: 360 },
      title: { text: 'Live market parallel coordinates' },
      subtitle: { text: 'Scores normalized from Binance ticker fields' },
      xAxis: { categories: ['Price', 'Change', 'Range', 'Volume', 'Trades'] },
      yAxis: { title: { text: null }, min: 0, max: 100 },
      plotOptions: { series: { animation: false, marker: { enabled: false } } },
      series: source.slice(0, 6).map((row) => ({
        type: 'line',
        name: row.name,
        data: [
          metricScore(row.price, Math.min(...prices), Math.max(...prices)),
          metricScore(row.changePercent, -10, 10),
          metricScore(rangePercent(row), 0, 12),
          metricScore(row.quoteVolume, 0, maxVolume),
          metricScore(row.trades || 0, 0, maxTrades)
        ]
      }))
    }),
    makeDynamicExample('Live Heikin Ashi candles', 'Heikin Ashi rendering from the selected Binance candle stream.', 'liveHeikinAshiOptions', {
      chart: { animation: false },
      title: { text: 'Live Heikin Ashi candles' },
      subtitle: { text: `${symbol} ${interval} candles` },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'heikinashi', name: symbol, data: candleRows }]
    }, 'stockChart'),
    makeDynamicExample('Live hollow candlestick', 'Hollow candlestick rendering from the selected Binance candle stream.', 'liveHollowCandlestickOptions', {
      chart: { height: 340, animation: false },
      title: { text: 'Live hollow candlestick' },
      subtitle: { text: `${symbol} ${interval} candles` },
      rangeSelector: { enabled: false },
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'hollowcandlestick', name: symbol, data: candleRows }]
    }, 'stockChart'),
    makeDynamicExample('Live market vector field', 'Vector direction and strength derived from Binance change and liquidity.', 'liveVectorOptions', {
      chart: { type: 'vector', height: 340 },
      title: { text: 'Live market vector field' },
      subtitle: { text: 'Direction from live change; length from change plus liquidity' },
      xAxis: { categories, min: -0.5, max: source.length - 0.5 },
      yAxis: { min: 0, max: 100, title: { text: 'Liquidity score' } },
      tooltip: { pointFormat: 'Length: <b>{point.length:.2f}</b><br/>Direction: <b>{point.direction} deg</b>' },
      plotOptions: { series: { animation: false } },
      series: [{
        type: 'vector',
        name: 'Momentum vectors',
        data: source.map((row, index) => [
          index,
          metricScore(row.quoteVolume, 0, maxVolume),
          Number((6 + Math.abs(row.changePercent) * 1.8 + (row.quoteVolume / maxVolume) * 6).toFixed(2)),
          row.changePercent >= 0 ? 45 : 225
        ])
      }]
    }),
    makeDynamicExample('Live market wind barb', 'Wind barb style view of live market momentum derived from Binance tickers.', 'liveWindbarbOptions', {
      chart: { height: 340 },
      title: { text: 'Live market wind barb' },
      subtitle: { text: 'Momentum style view derived from Binance ticker movement' },
      xAxis: { type: 'datetime' },
      yAxis: { title: { text: 'Momentum speed' } },
      plotOptions: { series: { animation: false } },
      series: [{
        type: 'windbarb',
        name: 'Momentum',
        data: source.map((row, index) => ({
          x: Date.now() + index * 60000,
          value: Number((Math.abs(row.changePercent) * 3 + rangePercent(row)).toFixed(2)),
          direction: row.changePercent >= 0 ? 70 : 250,
          name: row.name
        }))
      }]
    }),
    makeDynamicExample('Live market flowmap', 'Flow links from a liquidity hub into tracked market points.', 'liveFlowmapOptions', {
      chart: { height: 380, map: null },
      title: { text: 'Live market flowmap' },
      subtitle: { text: 'Flow links weighted by live quote volume' },
      mapView: { projection: { name: 'WebMercator' }, center: [-42, 18], zoom: 1.35 },
      plotOptions: { series: { animation: false } },
      series: [
        { type: 'mappoint', name: 'Market points', data: [flowHub, ...marketPoints], marker: { radius: 6 } },
        {
          type: 'flowmap',
          name: 'Liquidity flow',
          data: marketPoints.map((point) => ({
            from: flowHub.id,
            to: point.id,
            weight: Math.max(1, Math.round(point.quoteVolume / 250000000)),
            color: point.value >= 0 ? '#02c076' : '#f6465d'
          })),
          markerEnd: { width: 8, height: 8 },
          opacity: 0.72
        }
      ]
    }),
    makeDynamicExample('Live geo heatmap', 'Geo heatmap cells from live market movement and liquidity.', 'liveGeoHeatmapOptions', {
      chart: { height: 380, map: null },
      title: { text: 'Live geo heatmap' },
      subtitle: { text: 'Market movement rendered as geographic heat cells' },
      mapView: { projection: { name: 'WebMercator' }, center: [-42, 18], zoom: 1.25 },
      colorAxis: { min: -5, max: 5, stops: [[0, '#f6465d'], [0.5, '#eef2f7'], [1, '#02c076']] },
      plotOptions: { series: { animation: false } },
      series: [{
        type: 'geoheatmap',
        name: '24h change',
        data: marketPoints.map((point) => ({
          name: point.name,
          value: point.value,
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [point.lon - 5, point.lat - 4],
              [point.lon + 5, point.lat - 4],
              [point.lon + 5, point.lat + 4],
              [point.lon - 5, point.lat + 4],
              [point.lon - 5, point.lat - 4]
            ]]
          }
        }))
      }]
    }),
    makeDynamicExample('Live market pictorial', 'Pictorial bars using live quote volume.', 'livePictorialOptions', {
      chart: { type: 'pictorial', height: 380 },
      title: { text: 'Live market pictorial' },
      subtitle: { text: 'Quote volume drawn through a reusable SVG path' },
      xAxis: { categories: topSixByVolume.map((row) => row.name) },
      yAxis: { title: { text: 'Quote volume score' }, max: 12 },
      plotOptions: {
        pictorial: {
          animation: false,
          stacking: 'normal',
          paths: [{
            definition: 'M 50 0 C 78 0 100 22 100 50 C 100 78 78 100 50 100 C 22 100 0 78 0 50 C 0 22 22 0 50 0 Z',
            max: 12
          }]
        }
      },
      series: [{
        type: 'pictorial',
        name: 'Quote volume',
        data: topSixByVolume.map((row) => ({
          y: Math.max(8, row.quoteVolume / 100000000),
          color: row.changePercent >= 0 ? '#02c076' : '#f6465d'
        }))
      }]
    }),
    makeDynamicExample('Live market contour', 'Contour surface from change, liquidity and volatility.', 'liveContourOptions', {
      chart: { type: 'contour', height: 380 },
      title: { text: 'Live market contour' },
      subtitle: { text: 'Surface built from live market metrics' },
      xAxis: { categories },
      yAxis: { categories: ['Change', 'Range', 'Volume', 'Trades', 'Price'], title: { text: null } },
      colorAxis: { stops: [[0, '#f6465d'], [0.5, '#eef2f7'], [1, '#02c076']] },
      plotOptions: { series: { animation: false, turboThreshold: 0 } },
      series: [{
        type: 'contour',
        name: 'Market surface',
        data: source.flatMap((row, x) => ([
          [x, 0, Number(row.changePercent.toFixed(3))],
          [x, 1, Number(rangePercent(row).toFixed(3))],
          [x, 2, Number((row.quoteVolume / 1000000000).toFixed(3))],
          [x, 3, Number(((row.trades || 0) / 1000000).toFixed(3))],
          [x, 4, Number(((row.price / Math.max(row.low, 1)) - 1).toFixed(3))]
        ]))
      }]
    }),
    makeDynamicExample('Live Renko price bricks', 'Renko StockChart generated from the selected candle stream.', 'liveRenkoOptions', {
      chart: { height: 380, animation: false },
      rangeSelector: { enabled: false },
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      title: { text: 'Live Renko price bricks' },
      subtitle: { text: 'Calculated from selected candle closes' },
      xAxis: { title: { text: 'Close sequence' } },
      yAxis: {
        min: Math.min(...closeValues) - Math.max(0.5, closeRange * 0.15),
        max: Math.max(...closeValues) + Math.max(0.5, closeRange * 0.15),
        title: { text: 'Price' }
      },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'renko', name: `${symbol} Renko`, data: renkoCloseSeries, boxSize: renkoBoxSize }]
    }, 'stockChart'),
    makeDynamicExample('Live point and figure', 'Point and figure StockChart generated from live candle closes.', 'livePointAndFigureOptions', {
      chart: { height: 380, animation: false },
      rangeSelector: { enabled: false },
      navigator: { enabled: false },
      scrollbar: { enabled: false },
      title: { text: 'Live point and figure' },
      subtitle: { text: 'Calculated from selected candle closes' },
      plotOptions: { series: { animation: false } },
      series: [{ type: 'pointandfigure', name: `${symbol} P&F`, data: pointAndFigureCloseSeries, boxSize: renkoBoxSize, reversalAmount: 1 }]
    }, 'stockChart'),
    makeDynamicExample('Live quote volume timeline', 'Timeline-style update trail from the latest candle volume.', 'liveVolumeTimelineOptions', {
      chart: { type: 'area', height: 340 },
      title: { text: 'Live quote volume timeline' },
      xAxis: { type: 'datetime' },
      yAxis: { title: { text: 'Volume' } },
      series: [{ type: 'area', name: 'Volume', data: volumeSeries }]
    })
  ];
}

type ChartErrorBoundaryState = {
  error: Error | null;
};

class ChartErrorBoundary extends Component<{ children: ReactNode }, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="chart-host chart-placeholder">
          {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

function LazyChartMount({
  minHeight,
  children
}: {
  minHeight: number;
  children: (isVisible: boolean) => ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;

    if (!node) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setHasEnteredViewport(true);
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;

        setIsVisible(nextVisible);

        if (nextVisible) {
          setHasEnteredViewport(true);
        }
      },
      {
        rootMargin: '160px 0px',
        threshold: 0.01
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="lazy-chart-mount"
      style={{ minHeight }}
      data-chart-mounted={hasEnteredViewport ? 'true' : 'false'}
      data-chart-visible={isVisible ? 'true' : 'false'}
    >
      {hasEnteredViewport ? (
        children(isVisible)
      ) : (
        <div
          className="chart-host chart-placeholder chart-lazy-placeholder"
          style={{ minHeight }}
          aria-busy="true"
        >
          Loading chart...
        </div>
      )}
    </div>
  );
}

function dynamicExampleNeedsOptionalModules(title: string) {
  return (
    title.includes('bubble') ||
    title.includes('polar') ||
    title.includes('gauge') ||
    title.includes('solid gauge') ||
    title.includes('heatmap') ||
    title.includes('funnel') ||
    title.includes('3D') ||
    title.includes('Heikin Ashi') ||
    title.includes('Renko')
  );
}

function DemoCard({
  title,
  description,
  codes = [],
  label = 'React',
  codeLabel = 'JSX / TS / SCSS',
  scssCode = '.chart-frame {\\n  min-height: 340px;\\n}\\n\\nchart, .chart-host {\\n  display: block;\\n  width: 100%;\\n}',
  controls,
  note,
  full = false,
  children
}: DemoCardProps) {
  return (
    <article className={`chart-card${full ? ' full' : ''}`}>
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{label}</span>
      </div>
      {controls}
      <div className="chart-frame">{children}</div>
      {note ? <div className="note">{note}</div> : null}
      <details className="tutorial-collapse">
        <summary>
          <span>Open tutorial</span>
          <small>{codeLabel}</small>
        </summary>
        <div className="code-layer-grid">
          <div>
            <h4>JSX</h4>
            <pre>{codes[0] || simpleChartCode('options')}</pre>
          </div>
          <div>
            <h4>TS</h4>
            <pre>{codes[1] || 'const options = { ...nativeHighchartsOptions };'}</pre>
          </div>
          <div>
            <h4>SCSS</h4>
            <pre>{scssCode}</pre>
          </div>
        </div>
      </details>
    </article>
  );
}

export function App({ reactLine }: AppProps) {
  const isStaticView = typeof window !== 'undefined' && (
    window.location.pathname.includes('/static') ||
    window.location.search.includes('view=static')
  );
  const binanceChartRef = useRef<ChartHandle | null>(null);
  const eventChartRef = useRef<ChartHandle | null>(null);
  const dynamicChartRef = useRef<ChartHandle | null>(null);
  const zAxisChartRef = useRef<ChartHandle | null>(null);
  const colorAxisChartRef = useRef<ChartHandle | null>(null);

  const logRef = useRef<(message: string) => void>(() => undefined);
  const [entries, setEntries] = useState<string[]>([]);
  const [modulesReady, setModulesReady] = useState(isStaticView ? optionalModulesReady : criticalModulesReady);
  const [moduleError, setModuleError] = useState<string | null>(optionalModuleError || criticalModuleError);
  const [module3dEnabled, setModule3dEnabled] = useState(true);
  const [moduleOptions, setModuleOptions] = useState<any>(() => makeModuleOptions(true));
  const [binanceSymbol, setBinanceSymbol] = useState('BNBUSDT');
  const [binanceInterval, setBinanceInterval] = useState('1s');
  const [binanceTheme, setBinanceTheme] = useState<'dark' | 'light'>('light');
  const [binanceStatus, setBinanceStatus] = useState('Loading candles...');
  const [binanceSocketStatus, setBinanceSocketStatus] = useState('Live updates disconnected');
  const [binanceReloadNonce, setBinanceReloadNonce] = useState(0);
  const [binanceOhlcData, setBinanceOhlcData] = useState<CandlePoint[]>(() => createFallbackCandles().ohlc);
  const [binanceVolumeData, setBinanceVolumeData] = useState<VolumePoint[]>(() => createFallbackCandles().volume);
  const [marketRows, setMarketRows] = useState<MarketRow[]>(FALLBACK_MARKETS);
  const [cryptoTreemapRows, setCryptoTreemapRows] = useState<CryptoTreemapRow[]>(FALLBACK_TREEMAP_COINS);
  const [cryptoTreemapStatus, setCryptoTreemapStatus] = useState('Loading CoinGecko top 50 market cap snapshot...');

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
      humanDatesOptions: makeHumanDatesOptions(),
      chartTypeMatrixExamples: makeChartTypeMatrixExamples()
    };
  });

  useEffect(() => {
    pushLog('Demo loaded successfully.');
  }, []);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;

    async function loadHistory() {
      const restUrl = `${BINANCE_REST_BASE}/klines?symbol=${encodeURIComponent(binanceSymbol)}&interval=${encodeURIComponent(binanceInterval)}&limit=300`;
      const wsUrl = `${BINANCE_WS_BASE}/${binanceSymbol.toLowerCase()}@kline_${binanceInterval}`;

      setBinanceStatus(`Loading candles for ${binanceSymbol} ${binanceInterval}...`);
      setBinanceSocketStatus('Waiting for live updates');

      try {
        const response = await fetch(restUrl);
        const payload = await response.json();
        const parsed = Array.isArray(payload)
          ? payload.map(normalizeKline).filter(Boolean) as Array<{ candle: CandlePoint; volume: VolumePoint }>
          : [];

        if (!cancelled && parsed.length) {
          setBinanceOhlcData(parsed.map((row) => row.candle));
          setBinanceVolumeData(parsed.map((row) => row.volume));
          setBinanceStatus('Candle history loaded');
        } else if (!cancelled) {
          setBinanceStatus('Candle history was empty; showing local fallback candles.');
        }
      } catch (error) {
        if (!cancelled) {
          setBinanceStatus('Candle history failed; showing local fallback candles.');
        }
      }

      if (cancelled) {
        return;
      }

      try {
        socket = new WebSocket(wsUrl);
        setBinanceSocketStatus('Connecting live updates');

        socket.onopen = () => setBinanceSocketStatus('Live updates connected');
        socket.onclose = () => setBinanceSocketStatus('Live updates disconnected');
        socket.onerror = () => setBinanceSocketStatus('Live updates error');
        socket.onmessage = (message) => {
          try {
            const event = JSON.parse(message.data);
            const kline = event.k || event.data?.k;

            if (!kline) {
              return;
            }

            const normalized = normalizeKline([
              kline.t,
              kline.o,
              kline.h,
              kline.l,
              kline.c,
              kline.v
            ]);

            if (!normalized) {
              return;
            }

            setBinanceOhlcData((current) => upsertTimePoint(current.slice(), normalized.candle));
            setBinanceVolumeData((current) => upsertTimePoint(current.slice(), normalized.volume));
            setBinanceSocketStatus(`Live update: ${new Date().toLocaleTimeString('en-US', { hour12: false })}`);
          } catch (error) {
            setBinanceSocketStatus('Live update parse error');
          }
        };
      } catch (error) {
        setBinanceSocketStatus('Live updates failed to start');
      }
    }

    loadHistory();

    return () => {
      cancelled = true;

      if (socket) {
        socket.onopen = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.close();
      }
    };
  }, [binanceSymbol, binanceInterval, binanceReloadNonce]);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;

    async function loadMarkets() {
      const symbols = encodeURIComponent(JSON.stringify(TRACKED_MARKETS));
      const restUrl = `${BINANCE_REST_BASE}/ticker/24hr?symbols=${symbols}`;

      try {
        const response = await fetch(restUrl);
        const payload = await response.json();
        const rows = Array.isArray(payload)
          ? payload.map(normalizeMarketRow).filter(Boolean) as MarketRow[]
          : [];

        if (!cancelled && rows.length) {
          setMarketRows(rows);
        }
      } catch (error) {
        // Dynamic market examples keep the local fallback if Binance is unavailable.
      }

      if (cancelled) {
        return;
      }

      try {
        const streams = TRACKED_MARKETS.map((symbol) => `${symbol.toLowerCase()}@miniTicker`).join('/');
        socket = new WebSocket(`${BINANCE_STREAM_BASE}${streams}`);

        socket.onmessage = (message) => {
          try {
            const event = JSON.parse(message.data);
            const payload = event.data || event;
            const row = normalizeMarketRow(payload);

            if (!row) {
              return;
            }

            setMarketRows((current) => mergeMarketRows(current, row));
          } catch (error) {
            // Keep the current rows when a streaming payload cannot be parsed.
          }
        };
      } catch (error) {
        // The fallback rows keep the examples usable when WebSocket is blocked.
      }
    }

    loadMarkets();

    return () => {
      cancelled = true;

      if (socket) {
        socket.onmessage = null;
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    async function loadCryptoTreemapSnapshot(showLoading: boolean) {
      if (showLoading) {
        setCryptoTreemapStatus('Loading CoinGecko top 50 market cap snapshot...');
      }

      try {
        const response = await fetch(COINGECKO_TREEMAP_URL);
        const payload = await response.json();
        const rows = Array.isArray(payload)
          ? payload.map(normalizeCoinGeckoCoin).filter((row) => row.marketCap > 0)
          : [];

        if (!cancelled && rows.length) {
          setCryptoTreemapRows(rows);
          setCryptoTreemapStatus(`CoinGecko market cap snapshot updated: top ${rows.length}`);
        } else if (!cancelled) {
          setCryptoTreemapStatus('CoinGecko market cap parse failed; using local fallback top 50');
        }
      } catch (error) {
        if (!cancelled) {
          setCryptoTreemapStatus('CoinGecko market cap snapshot failed; using local fallback top 50');
        }
      }
    }

    loadCryptoTreemapSnapshot(true);
    timer = window.setInterval(() => loadCryptoTreemapSnapshot(false), 60000);

    return () => {
      cancelled = true;

      if (timer !== null) {
        window.clearInterval(timer);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOptionalModules() {
      if (!isStaticView) {
        setModulesReady(criticalModulesReady);
        setModuleError(criticalModuleError);
        return;
      }

      if (optionalModulesReady || optionalModuleError) {
        setModulesReady(optionalModulesReady);
        setModuleError(optionalModuleError);

        if (optionalModulesReady) {
          pushLog('Optional modules loaded.');
        }

        return;
      }

      try {
        await preloadOptionalHighchartsModules();

        if (!mounted) {
          return;
        }

        setModulesReady(optionalModulesReady);
        setModuleError(optionalModuleError);

        if (optionalModulesReady) {
          pushLog('Optional modules loaded.');
        } else if (optionalModuleError) {
          pushLog('Optional modules failed to load.');
          pushLog(`Module error: ${optionalModuleError}`);
        }
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
  }, [isStaticView]);

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
      requiresModules = false,
      immutable = false,
      allowChartUpdate = true,
      updateMode = 'options',
      updateArgs,
      chartKey,
      minHeight
    }: {
      stock?: boolean;
      chartRef?: any;
      requiresModules?: boolean;
      immutable?: boolean;
      allowChartUpdate?: boolean;
      updateMode?: 'options' | 'series-data';
      updateArgs?: [boolean?, boolean?, boolean?];
      chartKey?: string;
      minHeight?: number;
    } = {}
  ) => {
    const resolvedMinHeight = minHeight || (
      typeof options?.chart?.height === 'number'
        ? options.chart.height
        : stock ? 380 : 340
    );

    return (
      <LazyChartMount minHeight={resolvedMinHeight}>
        {(isChartVisible) => {
          if (requiresModules && !modulesReady) {
            return (
              <div
                className="chart-host chart-placeholder"
                style={{ minHeight: resolvedMinHeight }}
              >
                Loading optional modules...
              </div>
            );
          }

          return (
            <ChartErrorBoundary>
              <Chart
                key={chartKey}
                ref={chartRef}
                highcharts={Highcharts as any}
                constructorType={stock ? 'stockChart' : 'chart'}
                options={options}
                allowChartUpdate={isChartVisible && allowChartUpdate}
                immutable={immutable}
                updateMode={updateMode}
                updateArgs={updateArgs}
                containerProps={{ className: 'chart-host', style: { minHeight: resolvedMinHeight } }}
              />
            </ChartErrorBoundary>
          );
        }}
      </LazyChartMount>
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
    humanDatesOptions,
    chartTypeMatrixExamples
  } = demoOptions;

  const binanceOptions = createCandleOptions(binanceTheme, binanceSymbol, binanceInterval, binanceOhlcData, binanceVolumeData);
  const binanceLastCandle = candleMeta(binanceOhlcData[binanceOhlcData.length - 1] || null);
  const dynamicExamples = createDynamicMarketExamples(
    marketRows,
    binanceOhlcData,
    binanceVolumeData,
    binanceSymbol,
    binanceInterval,
    cryptoTreemapRows,
    cryptoTreemapStatus
  );

  if (!isStaticView) {
    return (
      <main className="shell">
        <header>
          <div className="header-copy">
            <span>React {reactLine} runtime / Highcharts 12.6.0</span>
            <h1>@stackline/react-highcharts 19.0.0</h1>
            <p>Project generated with the React 19 Vite blueprint and running the maintained React 19 package line.</p>
          </div>
          <div className="header-actions">
            <a className="btn secondary header-cta" href="?view=static">Open static examples</a>
          </div>
        </header>

        <section className={`chart-card live-market-card market-${binanceTheme}`}>
          <div className="chart-head market-head">
            <div>
              <h2>Live crypto candles</h2>
              <p>Live candle chart with realtime updates, light and dark modes.</p>
            </div>
            <span>StockChart</span>
          </div>

          <div className="market-toolbar">
            <div>
              <strong>Theme</strong>
              <button type="button" className={binanceTheme === 'dark' ? 'active' : ''} onClick={() => setBinanceTheme('dark')}>Dark</button>
              <button type="button" className={binanceTheme === 'light' ? 'active' : ''} onClick={() => setBinanceTheme('light')}>Light</button>
            </div>
            <div>
              <strong>Symbol</strong>
              {BINANCE_SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className={symbol === binanceSymbol ? 'active' : ''}
                  onClick={() => setBinanceSymbol(symbol)}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <div>
              <strong>Interval</strong>
              {BINANCE_INTERVALS.map((interval) => (
                <button
                  key={interval}
                  type="button"
                  className={interval === binanceInterval ? 'active' : ''}
                  onClick={() => setBinanceInterval(interval)}
                >
                  {interval}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="reload-button"
              onClick={() => setBinanceReloadNonce((current) => current + 1)}
            >
              Reload
            </button>
          </div>

          {binanceLastCandle ? (
            <div className="market-ticker">
              <span><em>Open</em> <strong>{formatPrice(binanceLastCandle.open)}</strong></span>
              <span><em>High</em> <strong>{formatPrice(binanceLastCandle.high)}</strong></span>
              <span><em>Low</em> <strong>{formatPrice(binanceLastCandle.low)}</strong></span>
              <span><em>Close</em> <strong>{formatPrice(binanceLastCandle.close)}</strong></span>
              <span className={binanceLastCandle.changePercent >= 0 ? 'positive' : 'negative'}>
                <em>Change</em> <strong>{formatPercent(binanceLastCandle.changePercent)}</strong>
              </span>
            </div>
          ) : null}

          <div className="market-status">
            <span>{binanceStatus}</span>
            <span>{binanceSocketStatus}</span>
            <span>{binanceOhlcData.length} candles</span>
          </div>

          <div className="chart-frame market-frame">
            {criticalModuleError
              ? <div className="chart-host chart-placeholder">{criticalModuleError}</div>
              : renderChart(binanceOptions, {
                stock: true,
                chartRef: binanceChartRef,
                updateMode: 'series-data',
                updateArgs: [true, true, false],
                chartKey: `binance-${binanceTheme}`,
                minHeight: 560
              })}
          </div>

          <details className="tutorial-collapse">
            <summary>
              <span>Open tutorial</span>
              <small>JSX / TS / SCSS</small>
            </summary>
            <div className="code-layer-grid">
              <div>
                <h4>JSX</h4>
                <pre>{`<section className="chart-card live-market-card market-light">\n  <Chart\n    highcharts={Highcharts}\n    constructorType="stockChart"\n    options={binanceOptions}\n  />\n</section>`}</pre>
              </div>
              <div>
                <h4>TS</h4>
                <pre>{`const { candles, volume } = await loadCandles(symbol, interval);\n\nsetBinanceOhlcData(candles);\nsetBinanceVolumeData(volume);\n\nconnectLiveCandles(symbol, interval, (nextCandle) => {\n  setBinanceOhlcData((current) => upsertCandle(current, nextCandle));\n});\n\nconst binanceOptions = createCandleOptions(theme, symbol, interval, ohlc, volume);`}</pre>
              </div>
              <div>
                <h4>SCSS</h4>
                <pre>{makeDynamicTutorialScss(560)}</pre>
              </div>
            </div>
          </details>
        </section>

        <section className="examples-grid">
          {dynamicExamples.map((example) => (
            <DemoCard
              key={example.title}
              full
              title={example.title}
              description={example.description}
              label="Live"
              codeLabel="JSX / TS / SCSS"
              codes={[example.tutorialHtml, example.tutorialTs]}
              scssCode={example.tutorialScss}
            >
              {renderChart(example.options, {
                stock: example.constructorType === 'stockChart',
                requiresModules: false,
                allowChartUpdate: example.allowChartUpdate !== false,
                updateMode: 'series-data',
                updateArgs: [true, true, false]
              })}
            </DemoCard>
          ))}
        </section>

        <section className="panel feature-panel">
          <div className="capability-grid">
            <div>
              <strong>Options API</strong>
              <span><code>{'<Chart highcharts={Highcharts} options={options} />'}</code></span>
            </div>
            <div>
              <strong>Constructor switch</strong>
              <span><code>constructorType="stockChart"</code></span>
            </div>
            <div>
              <strong>Native refs</strong>
              <span><code>chartRef.current.chart</code> exposes the real Highcharts instance.</span>
            </div>
            <div>
              <strong>Highcharts modules</strong>
              <span>more, stock, map, 3d, heatmap, treemap, drilldown, sankey, networkgraph, renko and more.</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header>
        <div className="header-copy">
          <span>React {reactLine} runtime / Highcharts 12.6.0</span>
          <h1>@stackline/react-highcharts 19.0.0</h1>
          <p>
            React 19 wrapper line for Highcharts, StockChart, modules, event callbacks,
            native refs, and full chart examples.
          </p>
        </div>
      </header>

      <section className="panel intro-panel">
        <div>
          <h2>Live examples</h2>
          <p>React 19 app generated as a clean Vite runtime and aligned with the Angular 21 live template.</p>
        </div>
        <div className="status-pill">84 rendered charts</div>
      </section>

      <section className="panel feature-panel">
        <div className="capability-grid">
          <div>
            <strong>Options API</strong>
            <span><code>{'<Chart highcharts={Highcharts} options={options} />'}</code></span>
          </div>
          <div>
            <strong>Constructor switch</strong>
            <span><code>constructorType="stockChart"</code></span>
          </div>
          <div>
            <strong>Native refs</strong>
            <span><code>chartRef.current.chart</code> exposes the real Highcharts instance.</span>
          </div>
          <div>
            <strong>Highcharts modules</strong>
            <span>more, stock, map, 3d, heatmap, treemap, drilldown, sankey, networkgraph, renko and more.</span>
          </div>
        </div>

        <details className="tutorial-collapse">
          <summary>
            <span>Open setup</span>
            <small>Install / JSX / modules</small>
          </summary>
          <div className="code-layer-grid">
            <div>
              <h4>Install</h4>
              <pre>{INSTALL_CODE}</pre>
            </div>
            <div>
              <h4>JSX</h4>
              <pre>{SETUP_CODE}</pre>
            </div>
            <div>
              <h4>Modules</h4>
              <pre>{MODULE_CODE}</pre>
            </div>
          </div>
        </details>
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
                {renderChart(stockOptions, { stock: true, requiresModules: true })}
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
                {renderChart(hlcOptions, { stock: true, requiresModules: true })}
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
                The React wrapper keeps Highcharts 12.6 as the latest maintained line,
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

          <article className="panel">
            <div className="panel-header">
              <h2>Full chart type matrix</h2>
              <p>
                One example per row, following the Angular 21 live template while using idiomatic
                React JSX and the same native Highcharts options surface.
              </p>
            </div>
            <div className="demo-grid">
              {chartTypeMatrixExamples.map((example) => (
                <DemoCard
                  key={example.title}
                  full
                  title={example.title}
                  description={example.description}
                  codes={[
                    example.stock ? simpleStockCode('options') : simpleChartCode('options'),
                    'const options = { ...nativeHighchartsOptions };'
                  ]}
                >
                  {renderChart(example.options, {
                    stock: example.stock,
                    requiresModules: example.requiresModules
                  })}
                </DemoCard>
              ))}
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
          <strong>@stackline/react-highcharts</strong> keeps the wrapper intentionally thin so React stays in charge
          of state while Highcharts stays in charge of rendering, interactivity, and advanced chart types.
        </p>
      </footer>
    </main>
  );
}
