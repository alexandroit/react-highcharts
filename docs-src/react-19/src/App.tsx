import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import Highstock from 'highcharts/highstock';
import type { Options } from 'highcharts';
import {
  Chart,
  exposeHighchartsGlobals,
  initHighchartsModules,
  type ChartHandle
} from '@revivejs/react-highcharts';

const INSTALL_CODE = `npm install @revivejs/react-highcharts highcharts`;

const SETUP_CODE = `import Highcharts from 'highcharts';\nimport { Chart } from '@revivejs/react-highcharts';\n\n<Chart highcharts={Highcharts} options={options} />`;

const STOCK_CODE = `import Highcharts from 'highcharts/highstock';\n\n<Chart\n  highcharts={Highcharts}\n  constructorType="stockChart"\n  options={stockOptions}\n/>`;

const MODULE_CODE = `import Highcharts from 'highcharts';\nimport {\n  exposeHighchartsGlobals,\n  initHighchartsModules\n} from '@revivejs/react-highcharts';\n\nexposeHighchartsGlobals(Highcharts);\n\nconst [{ default: Highcharts3D }, { default: HeatmapModule }] = await Promise.all([\n  import('highcharts/highcharts-3d.js'),\n  import('highcharts/modules/heatmap.js')\n]);\n\ninitHighchartsModules(Highcharts, Highcharts3D, HeatmapModule);`;

const IMPERATIVE_CODE = `const chartRef = useRef<ChartHandle>(null);\n\nchartRef.current?.chart?.series[0]?.addPoint(28);`;

type AppProps = {
  reactLine: string;
};

function stamp(message: string) {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })} ${message}`;
}

function makeBasicOptions(log: (message: string) => void): Options {
  return {
    chart: {
      animation: false,
      events: {
        load() {
          log('basic chart ready.');
        },
        click() {
          log('basic chart clicked.');
        }
      }
    },
    title: { text: 'Basic chart' },
    subtitle: { text: 'Thin wrapper usage' },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      title: { text: 'Revenue' }
    },
    legend: {
      enabled: true
    },
    series: [
      {
        type: 'line',
        name: 'North',
        data: [24, 28, 32, 37, 43, 48]
      },
      {
        type: 'line',
        name: 'South',
        data: [18, 21, 27, 29, 34, 39]
      }
    ]
  };
}

function makeStockOptions(log: (message: string) => void): Options {
  return {
    chart: {
      animation: false,
      events: {
        load() {
          log('stock chart ready.');
        }
      }
    },
    title: { text: 'StockChart' },
    rangeSelector: { selected: 1 },
    series: [
      {
        type: 'line',
        name: 'AAPL',
        data: [
          [1704067200000, 187],
          [1706745600000, 191],
          [1709251200000, 203],
          [1711929600000, 198],
          [1714521600000, 214],
          [1717200000000, 219]
        ]
      }
    ]
  };
}

function makeHeatmapOptions(log: (message: string) => void): Options {
  return {
    chart: {
      type: 'heatmap',
      animation: false,
      events: {
        load() {
          log('heatmap module ready.');
        }
      }
    },
    title: { text: 'Heatmap module' },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    yAxis: {
      categories: ['Morning', 'Noon', 'Afternoon', 'Evening'],
      title: undefined
    },
    colorAxis: {
      min: 0,
      minColor: '#eef4fb',
      maxColor: '#102033'
    },
    series: [
      {
        type: 'heatmap',
        name: 'Sessions',
        data: [
          [0, 0, 6],
          [1, 0, 8],
          [2, 0, 5],
          [3, 0, 4],
          [4, 0, 7],
          [0, 1, 7],
          [1, 1, 9],
          [2, 1, 8],
          [3, 1, 6],
          [4, 1, 8],
          [0, 2, 4],
          [1, 2, 7],
          [2, 2, 9],
          [3, 2, 7],
          [4, 2, 6],
          [0, 3, 3],
          [1, 3, 5],
          [2, 3, 6],
          [3, 3, 5],
          [4, 3, 4]
        ]
      }
    ]
  };
}

function makeThreeDOptions(log: (message: string) => void): Options {
  return {
    chart: {
      type: 'column',
      animation: false,
      options3d: {
        enabled: true,
        alpha: 14,
        beta: 16,
        depth: 48,
        viewDistance: 25
      },
      events: {
        load() {
          log('3D module ready.');
        }
      }
    },
    title: { text: '3D columns' },
    xAxis: {
      categories: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    yAxis: {
      title: { text: 'Deals' }
    },
    series: [
      {
        type: 'column',
        name: 'Closed',
        data: [12, 18, 24, 21]
      }
    ]
  };
}

function makeImperativeOptions(log: (message: string) => void): Options {
  return {
    chart: {
      animation: false,
      events: {
        load() {
          log('imperative chart ready.');
        }
      }
    },
    title: { text: 'Imperative access' },
    xAxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    },
    yAxis: {
      title: { text: 'Leads' }
    },
    series: [
      {
        type: 'area',
        name: 'Leads',
        data: [8, 10, 13, 16]
      }
    ]
  };
}

export function App({ reactLine }: AppProps) {
  const chartRef = useRef<ChartHandle>(null);
  const logRef = useRef<(message: string) => void>(() => undefined);
  const [entries, setEntries] = useState<string[]>([]);
  const [modulesReady, setModulesReady] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  const pushLog = (message: string) => {
    setEntries((current) => [stamp(message), ...current].slice(0, 8));
  };

  logRef.current = pushLog;

  const [basicOptions] = useState(() =>
    makeBasicOptions((message) => logRef.current(message))
  );
  const [stockOptions] = useState(() =>
    makeStockOptions((message) => logRef.current(message))
  );
  const [heatmapOptions] = useState(() =>
    makeHeatmapOptions((message) => logRef.current(message))
  );
  const [threeDOptions] = useState(() =>
    makeThreeDOptions((message) => logRef.current(message))
  );
  const [imperativeOptions] = useState(() =>
    makeImperativeOptions((message) => logRef.current(message))
  );

  useEffect(() => {
    pushLog('demo loaded successfully.');
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOptionalModules() {
      try {
        exposeHighchartsGlobals(Highcharts);

        const [{ default: Highcharts3D }, { default: HeatmapModule }] =
          await Promise.all([
            import('highcharts/highcharts-3d.js'),
            import('highcharts/modules/heatmap.js')
          ]);

        initHighchartsModules(Highcharts, Highcharts3D, HeatmapModule);

        if (!mounted) {
          return;
        }

        setModulesReady(true);
        pushLog('optional modules loaded.');
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Unknown module loader error.';

        setModuleError(message);
        pushLog('optional modules failed to load.');
      }
    }

    loadOptionalModules();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-card">
          <div className="badge">REACT {reactLine} · HIGHCHARTS 12.5</div>
          <h1>@revivejs/react-highcharts</h1>
          <p className="lead">
            A thin React wrapper for Highcharts that follows the familiar
            community pattern: pass the Highcharts instance, pass an options
            object, and grab the chart through a ref when you need imperative
            access.
          </p>
          <div className="feature-grid">
            <article>
              <h3>Thin by design</h3>
              <p>The component stays close to the native Highcharts API.</p>
            </article>
            <article>
              <h3>Imperative ref</h3>
              <p>Use a React ref to reach the live chart instance.</p>
            </article>
            <article>
              <h3>Stock support</h3>
              <p>Switch constructors with a simple <code>constructorType</code> prop.</p>
            </article>
            <article>
              <h3>Optional modules</h3>
              <p>Initialize 3D, heatmap, and other modules the standard Highcharts way.</p>
            </article>
          </div>
        </div>

        <aside className="hero-card setup-card">
          <h2>Setup in 3 steps</h2>
          <ol className="setup-list">
            <li>
              <span>Install</span>
              <pre className="code">{INSTALL_CODE}</pre>
            </li>
            <li>
              <span>Render a chart</span>
              <pre className="code">{SETUP_CODE}</pre>
            </li>
            <li>
              <span>Enable modules</span>
              <pre className="code">{MODULE_CODE}</pre>
            </li>
          </ol>
        </aside>
      </section>

      <div className="layout">
        <main className="main-column">
          <section className="section-card">
            <div className="section-heading">
              <h2>Core usage</h2>
              <p>One wrapper component, one options object, one Highcharts instance.</p>
            </div>

            <article className="demo-card">
              <div className="demo-copy">
                <h3>Basic chart</h3>
                <p>Pass a normal Highcharts options object into the wrapper.</p>
                <pre className="code">{SETUP_CODE}</pre>
              </div>
              <div className="chart-frame">
                <Chart
                  highcharts={Highcharts}
                  options={basicOptions}
                  containerProps={{ className: 'chart-host' }}
                />
              </div>
            </article>

            <article className="demo-card">
              <div className="demo-copy">
                <h3>Stock chart</h3>
                <p>Use the Highstock bundle and switch to <code>stockChart</code>.</p>
                <pre className="code">{STOCK_CODE}</pre>
              </div>
              <div className="chart-frame">
                <Chart
                  highcharts={Highstock}
                  constructorType="stockChart"
                  options={stockOptions}
                  containerProps={{ className: 'chart-host' }}
                />
              </div>
            </article>
          </section>

          <section className="section-card">
            <div className="section-heading">
              <h2>Optional modules</h2>
              <p>React apps typically initialize Highcharts modules once at module scope.</p>
            </div>

            <article className="demo-card">
              <div className="demo-copy">
                <h3>Heatmap</h3>
                <p>The wrapper stays unchanged after you register the module.</p>
                <pre className="code">{MODULE_CODE}</pre>
              </div>
              <div className="chart-frame">
                {modulesReady ? (
                  <Chart
                    highcharts={Highcharts}
                    options={heatmapOptions}
                    containerProps={{ className: 'chart-host' }}
                  />
                ) : (
                  <div className="chart-host chart-placeholder">
                    Loading optional modules…
                  </div>
                )}
                {moduleError ? <p className="module-error">{moduleError}</p> : null}
              </div>
            </article>

            <article className="demo-card">
              <div className="demo-copy">
                <h3>3D columns</h3>
                <p>The same component can render 3D charts once the module is active.</p>
                <pre className="code">{MODULE_CODE}</pre>
              </div>
              <div className="chart-frame">
                {modulesReady ? (
                  <Chart
                    highcharts={Highcharts}
                    options={threeDOptions}
                    containerProps={{ className: 'chart-host' }}
                  />
                ) : (
                  <div className="chart-host chart-placeholder">
                    Loading optional modules…
                  </div>
                )}
                {moduleError ? <p className="module-error">{moduleError}</p> : null}
              </div>
            </article>
          </section>

          <section className="section-card">
            <div className="section-heading">
              <h2>Imperative access</h2>
              <p>When you need to bridge to Highcharts directly, use a ref.</p>
            </div>

            <article className="demo-card">
              <div className="demo-copy">
                <h3>Ref-driven updates</h3>
                <p>Add points directly through the chart instance without replacing the component.</p>
                <pre className="code">{IMPERATIVE_CODE}</pre>
                <button
                  className="action"
                  onClick={() => {
                    chartRef.current?.chart?.series[0]?.addPoint(
                      Math.floor(18 + Math.random() * 14)
                    );
                    pushLog('added a point through the chart ref.');
                  }}
                >
                  Add point
                </button>
              </div>
              <div className="chart-frame">
                <Chart
                  ref={chartRef}
                  highcharts={Highcharts}
                  options={imperativeOptions}
                  containerProps={{ className: 'chart-host' }}
                />
              </div>
            </article>
          </section>
        </main>

        <aside className="log-panel">
          <div className="log-header">
            <h2>Event Log</h2>
            <button className="clear" onClick={() => setEntries([])}>
              Clear
            </button>
          </div>
          <p>Interact with the demos to see Highcharts and wrapper events appear here.</p>
          <div className="log-list">
            {entries.map((entry) => (
              <div key={entry} className="log-item">
                {entry}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
