Protomorph: shared build
========================

Contains a standard build for working on frontend applications based on webpack
using ts, js and scss. Also contains configuration for js, scss and html linters.

```shell
mkdir my-frontend-app
cd my-frontend-app
yarn init
```

Add this repo into the devDependencies in your package.json.

```json
...
"@itslearning/protomorph": "git://github.com/itslearning/protomorph.git#TAG_NAME"
...
```

```shell
yarn install
```

You need to create a `webpack.config.js` and require the protomorph webpack configuration. It shouldn't require much.

```javascript
const baseConfig = require('@itslearning/protomorph/webpack.config');

// You can override the protomorph webpack config here
const config = Object.assign({}, baseConfig, {
    entry: {
        'index': './src/index.js'
    }
});

module.exports = config;
```

## Webpack for js and sass

Please read the webpack.config.js.

You can override the entire config in your project or just some of it.

Available plugins:
- extract-text-webpack-plugin
- clean-webpack-plugin
- copy-webpack-plugin
- on-build-webpack

## Order of build

- Removes existing dist folder
- Builds js, ts and scss
- Removes unnecessary intermediate files created by webpack during build

## Karma test runner

## Linting
For js, sass and html coding standards, provided are configs for:

- eslint (.eslintrc.json)
- sass-lint (.sass-lint.yml)
- htmlhint (.htmlhintrc)

For sass linting in the IDE, you will need to configure your workspace settings
to use the lint files in this project.

You may find copying the linting files into your root folder easier to use.

TODO:
- Automate html linting (maybe https://www.npmjs.com/package/htmllint-loader)
