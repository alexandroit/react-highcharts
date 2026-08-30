# Changelog

All notable changes to `@stackline/react-highcharts` are documented here.

## Unreleased

- Updated the React 17 and React 18 documentation apps to the same patched
  Vite 8.2 toolchain as React 19, committed reproducible lockfiles, and added
  every supported demo line to the browser CI job.
- Moved exact-version dependency records to `package.fixture.json`, repaired
  their validators, and added an offline catalog contract to keep historical
  metadata out of active dependency alerts.

## 19.1.1 - 2026-08-30

- Validate React 19.2.8 and React DOM 19.2.8 with Highcharts 13.0.2.
- Extend only the tested Highcharts peer ceiling; the component, helper, and
  TypeScript APIs are unchanged.
- Verify direct production installs without warnings or known audit findings.

## 19.1.0 - 2026-08-19

- Validate the current line with React 19.2.8, React DOM 19.2.8, and Highcharts 13.0.1.
- Keep the existing React 19 wrapper API while extending the tested Highcharts peer ceiling to 13.0.1.
- Keep public update argument declarations compatible with the historical Highcharts 6 type package.
- Keep imperative refs connected to the live chart and container instead of snapshotting their initial values.
- Apply every consecutive immutable update instead of skipping the update after a chart recreation.
- Add DOM lifecycle, module idempotency, package, audit, and real-browser documentation contracts.
- Update the React 19 docs toolchain to a supported Vite 8 line and remove known Vite/esbuild advisories.
- Keep TypeScript 5.9 for stable declaration generation after validating that the current TypeScript 7 release is not yet compatible with tsup's declaration worker.

## 19.0.0 - 2026-06-20

- Publish the maintained React 19 package family.
