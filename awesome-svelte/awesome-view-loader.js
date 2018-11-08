const BuildUtils = require('./build-utils');
const VirtualModules = require('svelte-loader/lib/virtual');
const loaderUtils = require('loader-utils');
const path = require('path');
const fs = require('fs');

const __defaultLoaderOptions = {
    scriptTemplateFilename: './view.template.js',
    styleTemplateFilename: './view.template.sass'
};

const __defaultViewSettings = {
    entry: './components/main.svelte',
    useStore: false,
    storeFactory: 'new Store()',
    extraImports: {},
    extraStyles: ['skins\\itsl-inuit.min.css'],
    polyfills: ['Fetch', 'Promise', 'ObjectAssign'],

    layout: '~/Views/Shared/_SvelteLayout.cshtml',
    id: null
};

function getMainFileContent(options, viewSettings, compilation, entrypointName) {
    const template = BuildUtils.getOrAddCompilationEntrypointData(compilation, entrypointName, '_svelteViewScriptTemplate', () => {
        return fs.readFileSync(options.scriptTemplateFilename);
    });

    return BuildUtils.replaceTemplatePlaceholders(
        template.toString(),
        {
            'entryname': viewSettings.entry,
            'instancesSelector': viewSettings.instancesSelector,
            'storeInitialization': viewSettings.useStore ? viewSettings.storeFactory : 'null',
            'additionalImports': viewSettings.useStore ? 'import { Store } from \'svelte/store.js\';' : ''
        }
    );
}

function getStylesFileContent(options, viewSettings, compilation, entrypointName) {
    let additionalImports = '';

    if (viewSettings.extraImports.scss) {
        viewSettings.extraImports.scss.forEach(element => {
            additionalImports += `@import "${element}";\r\n`;
        });
    }

    const template = BuildUtils.getOrAddCompilationEntrypointData(compilation, entrypointName, '_svelteViewStyleTemplate', () => {
        return fs.readFileSync(options.styleTemplateFilename);
    });

    return BuildUtils.replaceTemplatePlaceholders(
        template.toString(),
        {
            'entryname': viewSettings.entry,
            'additionalImports': additionalImports
        }
    );
}

const virtualModuleInstances = new Map();

module.exports = function (source, map) {
    try {
        const options = Object.assign(
            {},
            __defaultLoaderOptions,
            loaderUtils.getOptions(this)
        );

        if (this._compiler && !virtualModuleInstances.has(this._compiler)) {
            virtualModuleInstances.set(this._compiler, new VirtualModules(this._compiler));
        }

        const entrypointName = BuildUtils.extractEntryPointNameFromFile(`./${path.relative(this.rootContext, this.resource)}`);

        const entryPointSpecificSettings = {
            instancesSelector: `document.querySelectorAll('[data-c-svelte-${entrypointName}]')`,
        };

        const viewSettings = Object.assign({}, __defaultViewSettings, entryPointSpecificSettings, JSON.parse(source));

        if (!this._compilation._viewSettings) {
            this._compilation._viewSettings = new Map();
        }

        this._compilation._viewSettings.set(entrypointName, viewSettings);
        const virtualModules = virtualModuleInstances.get(this._compiler);

        if (virtualModules) {
            virtualModules.writeModule(path.join(this.context, `${entrypointName}.main.js`), getMainFileContent(options, viewSettings, this._compilation, entrypointName));
            virtualModules.writeModule(path.join(this.context, `${entrypointName}.main.scss`), getStylesFileContent(options, viewSettings, this._compilation, entrypointName));
        }

        return `
        import "./${entrypointName}.main.scss";
        import "./${entrypointName}.main.js";
        `;
    } catch (error) {
        console.log(error);
        this.callback(new Error(error.message));
    }
};
