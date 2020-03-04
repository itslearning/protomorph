# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v10.4.2] - 04.03.2020

### Fixed

- Downgraded core-js to v3.6.1 to fix IE11 compatibility issue

## [v10.4.1] - 17.02.2020

### Fixed

- Fixed rollup module bundle for edge support

## [v10.4.0] - 29.01.2020

### Changed

- Internal changes: Update to sass-lint v1.3.1
- Internal changes: Update to webpack-cli v3.3.10
- Internal changes: Update to fsevents v1.2.11
- Internal changes: Update to @rollup/plugin-node-resolve v7.0.0
- Internal changes: Update to @rollup/plugin-commonjs v11.0.1
- Internal changes: Update to karma v4.4.1
- Internal changes: Update to node-sass v4.13.1

## [v10.3.0] - 23.01.2020

### Changed

- Internal changes: Update to autoprefixer v9.7.3
- Internal changes: Update to core-js v3.6.4
- Internal changes: Update to babel v7.8.3
- Internal changes: Update to axe-core v3.4.1
- Internal changes: Update to eslint v6.8.0
- Internal changes: Update rollup and rollup plugins

## [v10.2.1] - 13.01.2020

## Fixed

- Fixed core-js import

## [v10.2.0] - 09.12.2019

### Changed

- Set SCSS output to `compressed`
- Update rollup.config.js to reflect latest changes

## [v10.1.0] - 09.12.2019

### Changed

- Internal changes: Update to Webpack v4.41.1
- Internal changes: Update to copy-webpack-plugin v5.0.5
- Internal changes: Resolves serialize-javascript to v2.1.1

## [v10.0.0] - 29.11.2019

### Changed

- Updated Axe-Core to v3.4.0
- Replaced itsl.rollup.js Sass parameter stylePlugins with options object
  containing plugins array
- Replaced itsl.rollup.js Svelte parameter scriptPlugins with options object
  containing plugins array
- Made itsl.rollup.js Svelte method return a module without es5 support by
  default
- Added support for itsl.rollup.js Svelte legacy builds with es5 support and
  automatic polyfilling with the `legacy` option
- Upgraded @babel/core to 7.6.0
- Upgraded @babel/plugin-proposal-object-rest-spread to 7.5.5
- Upgraded @babel/preset-env to 7.6.0
- Replaced rollup-plugin-uglify with rollup-plugin-terser
- Upgraded eslint to 6.4.0
- Upgraded rollup to 1.21.4
- Upgraded all rollup plugin versions
- Set eslint default lint file to protomorph/.eslintrc.json
- Added eslint options support to svelte options parameter

## [v9.9.1] - 02.10.2019

### Fixed

- Fixed errors in changelog

## [v9.9.0] - 02.10.2019

### Changed

- export sass/svelte from itsl.rollup

## [v9.8.0] - 30.08.2019

### Changed

- Updated mixin-deep to v1.3.2
- Updated set-value to v2.0.1

## [v9.7.0] - 30.08.2019

### Added

- Plugin support for itsl.rollup.js

## [v9.6.1] - 27.08.2019

### Changed

- Updated eslint-utils to v1.4.1

## [v9.6.0] - 09.08.2019

### Changed

- Updated lodash.mergewith to v4.6.2

## [v9.5.0] - 09.08.2019

### Changed

- Updated lodash.template to v4.5.0

## [v9.4.0] - 08.08.2019

### Changed

- Updated lodash to v4.17.14

## [v9.3.1] - 21.06.2019

### Fixed

- Fixed changelog

## [v9.3.0] - 21.06.2019

### Changed

- Updated sass-lint to v1.13.0

## [v9.2.2] - 18.06.2019

### Changed

- Updated cssloader to v3.0.0

## [v9.2.0] - 06.06.2019

### Changed

- Fixed js-yaml security issue

## [v9.1.0] - 31.05.2019

### Changed

- Updated karma version

## [v9.0.0] - 02.04.2019

### Added

- This changelog!
- Initial support for using Rollup to build packages. Use `rbuild` and `rdev`.

### Changed

- Updated old Babel packages

### Deprecated

- Webpack support. Will be removed in next version.
