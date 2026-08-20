# Security Policy

## Supported Version

Security fixes are applied to the current `@stackline/react-highcharts` release line. Older React-major lines remain available for compatibility but do not receive every dependency update automatically.

## Reporting

Please report suspected vulnerabilities privately through the repository's GitHub Security Advisory interface. Do not open a public issue with exploit details before a fix is available.

Include the affected package version, React and Highcharts versions, a minimal reproduction, and the expected impact when possible.

## Application-Owned Options

The wrapper passes native Highcharts option objects and callbacks through to Highcharts. Applications must validate untrusted data before using it in executable callbacks, formatter functions, URLs, or HTML-enabled chart content.
