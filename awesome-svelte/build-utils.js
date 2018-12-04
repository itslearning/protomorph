const glob = require('glob');
const path = require('path');

/**
 * Extract entry point name from entry point file path.
 * @example './StudentPlan/Overview/view.json' converted to 'studentplan_overview'.
 * @param {string} fileName The file path of the entry point view.json file.
 * @return {string} The entry point name.
 */
function extractEntryPointNameFromFile(fileName, areaName) {
    const regex = /[/\\]src[/\\]([^/]+)[/\\]view\.json$/gi;

    const match = regex.exec(fileName);

    if (match === null) {
        throw new Error(`Can't parse entrypoint name from file ${fileName}`);
    }

    return `${areaName}_${match[1]}`;
}

/**
 * Parse entrypoint name to extract information, like area and page name.
 * @param {string} entrypointName The entrypoint name.
 * @return {{name: string}, {area: string}, {page: string}} The parsed information from entrypoint name:
 * `name` - the entrypoint name
 * `area` - the name of area
 * `page` - the name of page
 */
function parseEntryPointName(entrypointName) {
    const match = /(.*)_(.*)/gi.exec(entrypointName);

    return {
        name: entrypointName,
        area: match[1],
        page: match[2]
    };
}

/**
 * Find entrypoint module.
 * @param {*} module The current webpack module object.
 * @return The entrypoint module.
 */
function findEntryModule(module) {
    if (module.issuer) {
        return findEntryModule(module.issuer);
    }

    return module;
}

/**
 * Create an additional information to compilation object to entrypoint specific context.
 * @param {*} compilation The webpack compilation object.
 * @param {string} entrypointName The entrypoint name.
 * @param {string} dataName The specified data name.
 * @param {function(): {*}} dataCreationCallback The callback to create a new data object.
 */
function addCompilationEntrypointData(compilation, entrypointName, dataName, dataCreationCallback) {
    if (!compilation[dataName]) {
        compilation[dataName] = new Map();
    }

    if (!compilation[dataName].has(entrypointName)) {
        compilation[dataName].set(entrypointName, dataCreationCallback());
    }
}

/**
 * Returns an additional data which attached to webpack compilation object from entrypoint specific context.
 * @param {*} compilation The webpack compilation object.
 * @param {string} entrypointName The entrypoint name.
 * @param {string} dataName The specified data name.
 */
function getCompilationEntrypointData(compilation, entrypointName, dataName) {
    return compilation[dataName].get(entrypointName);
}

/**
 * Returns or create an additional information to compilation object to entrypoint specific context.
 * @param {*} compilation The webpack compilation object.
 * @param {string} entrypointName The entrypoint name.
 * @param {string} dataName The specified data name.
 * @param {function(): {*}} dataCreationCallback The callback to create a new data object.
 */
function getOrAddCompilationEntrypointData(compilation, entrypointName, dataName, dataCreationCallback) {
    addCompilationEntrypointData(compilation, entrypointName, dataName, dataCreationCallback);

    return getCompilationEntrypointData(compilation, entrypointName, dataName);
}

/**
 * Escape all RegExp chars.
 * @param {string} string The input string.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Process all `{{placeholders}}` in source template content with specified content.
 * @param {string} source The template source text, that should be processed.
 * @param {object} placeholders The object with placeholder names and values to replacement.
 */
function replaceTemplatePlaceholders(source, placeholders) {
    let result = source;

    new Map(Object.entries(placeholders)).forEach((value, key) => {
        const search = new RegExp(`{{${escapeRegExp(key)}}}`, 'g');

        result = result.replace(search, value);
    });

    return result;
}

function getBasePatternToEntryPoints(startupConfiguration) {
    return `./src/${startupConfiguration.build.page}/`;
}

function buildScriptsEntryPoints(startupConfiguration, areaName) {
    const scriptFiles = glob.sync('./' + path.join(getBasePatternToEntryPoints(startupConfiguration), 'view.json'));

    const entry = {};

    scriptFiles.forEach(scriptFilePath => {
        const entryName = extractEntryPointNameFromFile(scriptFilePath, areaName);

        entry[entryName] = scriptFilePath;
    });

    return entry;
}

function buildScriptsEntryPointsForSrcFolderInArea(areaName) {
    const buildConfig = readStartupConfiguration(areaName);

    // TODO Implement validation of build config parameters
    printStartupConfiguration(buildConfig);

    const entryPoints = buildScriptsEntryPoints(buildConfig, areaName);

    // TODO Validate that at least one entry point found
    printEntryPoints(entryPoints);

    return entryPoints;
}

/**
 * Joins and sorts all strings into one comma separated quotes wrapped value.
 * @param {Array<string>} array
 */
function joinAndSortStrings(array) {
    return Array.from(array).sort().map((item) => {
        return `"${item.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }).join(',\n');
}

/**
 * Joins all strings into one comma separated quotes wrapped value.
 * @param {Array<string>} array
 */
function joinStrings(array) {
    return Array.from(array).map((item) => {
        return `"${item.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }).join(',\n');
}

/**
 * Gets all assets with the specific type based on a regexp provided.
 * @param {*} compilation Compilation of WebPack.
 * @param {string} pathSegment Path segment.
 * @param {RegExp} typeRegexp Rexexp for the file name.
 * @param {string} staticPath Path to the statics folder.
 */
function extractAssetsOfType(compilation, pathSegment, typeRegexp, staticPath) {
    const segmentRegexp = new RegExp(`[\\/\\\\]${escapeRegExp(pathSegment)}[\\/\\\\]`, 'i');

    return Object.keys(compilation.assets)
        .map(value => path.resolve(compilation.compiler.outputPath, value))
        .filter(value => {
            return segmentRegexp.test(value);
        })
        .filter(value => typeRegexp.test(value))
        .map(value => path.relative(path.resolve(staticPath), value));
}

function readStartupConfiguration(area) {
    const pageArgumentPrefix = '--env.page=';

    const startupConfiguration = {};

    // Read working area and page
    startupConfiguration.build = {
        area: area,
        page: '*'
    };

    const pageArgIndex = process.argv.findIndex(arg => arg.startsWith(pageArgumentPrefix));

    if (pageArgIndex >= 0) {
        startupConfiguration.build.page = process.argv[pageArgIndex].substr(pageArgumentPrefix.length);
    }

    return startupConfiguration;
}

function printStartupConfiguration(startupConfiguration) {
    console.log(startupConfiguration);
}

function printEntryPoints(entryPoints) {
    console.log(entryPoints);
}

module.exports = {
    extractEntryPointNameFromFile,
    parseEntryPointName,
    findEntryModule,
    addCompilationEntrypointData,
    getCompilationEntrypointData,
    getOrAddCompilationEntrypointData,
    replaceTemplatePlaceholders,
    getBasePatternToEntryPoints,
    buildScriptsEntryPoints,
    buildScriptsEntryPointsForSrcFolderInArea,
    joinAndSortStrings,
    joinStrings,
    extractAssetsOfType
};
