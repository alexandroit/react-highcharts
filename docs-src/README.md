# Compatibility Fixture Catalog

The buildable documentation applications live directly under each framework
family, for example `docs-src/angular-22`, `docs-src/react-19`, or
`docs-src/vue-3`. Those applications keep normal package manifests and are
covered by the repository's build and audit jobs.

Nested exact-version directories are immutable compatibility records. Their
dependency data is stored as `package.fixture.json` on purpose so GitHub and
other security tools do not mistake archived metadata for a deployed
application. These records are not installed in CI and are not included in the
published npm package.

Run `npm run test:fixtures` from the repository root to validate every record.
The contract checks framework pins, family and directory versions, local package
references, privacy, and validator wiring without executing end-of-life
toolchains.

Do not use a nested fixture as an application template. Security support follows
the current package line and the framework vendor's supported release lifecycle.

## Current React 19 documentation

The current demo installs the repository package through `file:../..` with React 19.2.8 and Highcharts 13.1.1, so CI validates the release candidate before publication. Run `npm ci`, `npm run build`, `npm --prefix docs-src/react-19 ci --ignore-scripts`, then `npm run build:docs`. The output is `docs/react-19`.

The React 17 and 18 demos retain their published wrappers. Their patch-scoped `highcharts` override selects 12.6.2 because those older wrappers cap the peer at 12.6.0. The demo builds validate this compatibility; the override does not change the published wrappers.
