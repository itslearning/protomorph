Protomorph: shared build
========================

Contains a standard build for working on frontend applications based on webpack
and various linters.

```shell
mkdir my-frontend-app
cd my-frontend-app
yarn init
```

Add this repo into the devDependencies in your package.json.

```json
...
"@plumpnation/protomorph": "git://github.com/plumpNation/protomorph.git#TAG_NAME"
...
```

```shell
yarn install
```

You need to create a `webpack.config.js` and require the protomorph webpack configuration. It shouldn't require much.

```javascript
const baseConfig = require('@plumpnation/protomorph/webpack.config');

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

## Karma test runner

## Linting
For js, sass and html coding standards.

- eslint
- sass-lint

For sass linting in the IDE, you will need to configure your workspace settings
to use the .sass-lint.yml file in this project.

Todo:
- html-lint
- babel or buble support
- typescript support
- axe for unit tests
