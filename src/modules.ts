import type Highcharts from 'highcharts';

export type HighchartsModuleFactory =
  | ((highcharts: typeof Highcharts) => void)
  | { default?: (highcharts: typeof Highcharts) => void };

type HighchartsGlobalScope = typeof globalThis & {
  Highcharts?: typeof Highcharts;
  _Highcharts?: typeof Highcharts;
};

const appliedModules = new WeakMap<object, Set<unknown>>();

export function exposeHighchartsGlobals(highcharts: typeof Highcharts) {
  const scope = globalThis as HighchartsGlobalScope;

  scope.Highcharts = highcharts;
  scope._Highcharts = highcharts;
}

export function initHighchartsModules(
  highcharts: typeof Highcharts,
  ...modules: HighchartsModuleFactory[]
) {
  exposeHighchartsGlobals(highcharts);

  const registry = appliedModules.get(highcharts) ?? new Set<unknown>();

  for (const entry of modules) {
    const factory = (entry as { default?: (highcharts: typeof Highcharts) => void }).default ?? entry;

    if (registry.has(factory)) {
      continue;
    }

    if (typeof factory === 'function') {
      factory(highcharts);
      registry.add(factory);
    }
  }

  appliedModules.set(highcharts, registry);
}
