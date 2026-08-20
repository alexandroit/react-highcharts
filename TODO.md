# TODO

## Release 19.1.0

- [x] Audit current React, Highcharts, TypeScript, Vite, and build-tool releases.
- [x] Preserve the public React 19 wrapper API and peer ownership model.
- [x] Fix live imperative refs and consecutive immutable updates.
- [x] Pass unit, package, docs, browser, consumer-matrix, and audit checks.
- [ ] Validate and publish one canonical artifact to Verdaccio.
- [ ] Push the source and pass GitHub Actions.
- [ ] Publish the canonical artifact to public npm.
- [ ] Create the GitHub tag and release assets.
- [ ] Deploy and verify the package documentation in production.

## Future Maintenance

- Revisit TypeScript 7 after tsup supports declaration generation with its compiler API.
- Keep Node type declarations aligned with the Node 22/24 CI runtime instead of adopting Node 26 types early.
- Keep React-major release tags intact when advancing the current line.
- Re-test Highcharts major upgrades in a browser before extending the peer ceiling.
- Keep application-owned Highcharts licensing and module setup explicit in the documentation.
