const BuildUtils = require('../awesome-svelte/build-utils')

const navigationUrlParameter = '__navigationParameterizedUrl';
const navigationDefaultsParameter = '__navigationDefaultValues';
const customEventPolyfill = 'CustomEvent';

function navigationViewSettingsEditor(viewSettings) {
    if (viewSettings.enableNavigation) {
        if (!viewSettings.polyfills) {
            viewSettings.polyfills = [customEventPolyfill];
        } else if (viewSettings.polyfills.indexOf(customEventPolyfill) < 0) {
            viewSettings.polyfills.push(customEventPolyfill);
        }
    }
}

function navigationPlaceholdersCreator(placeholders, viewSettings, entrypointName) {
    if (viewSettings.enableNavigation) {
        placeholders.additionalImports = placeholders.additionalImports ? '\n' : '' + 'import bindToNavigationParamsWithinFrame from \'@itslearning/atlas/navigation/navigationBinderWithinIframe\';'
        const menuItem = viewSettings.mainMenuItem || BuildUtils.parseEntryPointName(entrypointName).area.toLowerCase();
        placeholders.navigationInitialization = `\n\n        bindToNavigationParamsWithinFrame(app, \'${navigationUrlParameter}\', \'${navigationDefaultsParameter}\', \'${menuItem}\');`;
    } else {
        placeholders.navigationInitialization = '';
    }
}

function navigationModelCreator(dataProperties, viewSettings) {
    if (viewSettings.enableNavigation) {
        dataProperties.push({
            name: navigationUrlParameter,
            description: 'Url to the page with parameters.',
            keywords: [],
            value: ''
        });
        dataProperties.push({
            name: navigationDefaultsParameter,
            description: 'Default values used for navigation.',
            keywords: [],
            value: {}
        });
    }
}

module.exports = {
    navigationPlaceholdersCreator,
    navigationModelCreator,
    navigationViewSettingsEditor
};