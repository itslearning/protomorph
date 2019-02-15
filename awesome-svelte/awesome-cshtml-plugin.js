const BuildUtils = require('./build-utils');
const VSProjUtils = require('./vsproj-utils');

const fs = require('fs');
const path = require('path');

const __defaultPluginConfiguration = {
    filename: './output/[area]/[page].cshtml',
    templateFilename: './view.template.cshtml',
    modelFilename: './output/[area]/[page].cs',
    modelNamespace: 'CodeGenNamespace',
    vsprojFilename: null,
    staticFolderPath: './'
};

function AwesomeCshtmlPlugin(options) {
    this.options = Object.assign({}, __defaultPluginConfiguration, options);
}

function buildCshtmlViewPage(options, configuration, compilation, localization, context, hasModel) {
    const template = BuildUtils.getOrAddCompilationEntrypointData(compilation, configuration.location.name, '_cshtmlTemplate', () => {
        return fs.readFileSync(options.templateFilename);
    });

    const stylesAssets = BuildUtils.extractAssetsOfType(compilation, configuration.location.name, /\.css$/i, options.staticFolderPath);
    const scriptAssets = BuildUtils.extractAssetsOfType(compilation, configuration.location.name, /\.js$/i, options.staticFolderPath);

    return BuildUtils.replaceTemplatePlaceholders(
        template.toString(),
        {
            'entryname': configuration.location.name.replace(/\./g, '_'),
            'styleEntries': BuildUtils.joinStrings(configuration.view.extraStyles.concat(stylesAssets)),
            'scriptEntries': BuildUtils.joinStrings(configuration.view.extraScripts.concat(scriptAssets)),
            'polyfillEntries': BuildUtils.joinAndSortStrings(configuration.view.polyfills),
            'localizationEntries': BuildUtils.joinAndSortStrings(localization),
            'contextEntries': BuildUtils.joinAndSortStrings(context),
            'view.id': configuration.view.id ? `id="${configuration.view.id}"` : '',
            'view.layout': configuration.view.layout,
            'modelName': hasModel
                ? `@model ${buildOutputFileName(options.modelNamespace, configuration)}.${configuration.location.page}ViewModel`
                : ''
        }
    );
}

function mapJSArrayTypeToCSharp(jsArrayType) {
    const arrayItemType = jsArrayType.substr(6, jsArrayType.length - 7);

    return 'System.Collections.Generic.IEnumerable<' + mapJSTypeToCSharp(arrayItemType) + '>';
}

function mapJSTypeToCSharp(jsType) {
    if (!jsType) {
        return 'object';
    }

    if (jsType === 'number') {
        return 'int';
    }

    if (jsType === 'string') {
        return 'string';
    }

    if (jsType === 'boolean' || jsType === 'bool') {
        return 'bool';
    }

    if (jsType === 'any') {
        return 'object';
    }

    if (jsType.indexOf('Array<') === 0) {
        return mapJSArrayTypeToCSharp(jsType);
    }

    return 'object';
}

function mapJSPropertyValueToCSharpType(valueNode) {
    if (valueNode.type === 'ArrayExpression') {
        return 'System.Collections.IEnumerable';
    }

    if (typeof (valueNode) === 'boolean') {
        return 'bool';
    }

    if (typeof (valueNode) === 'number') {
        return 'int';
    }

    if (typeof (valueNode) === 'string') {
        return 'string';
    }

    return 'object';
}

function getPropertyType(property) {
    // Try to use CSharp type if specified
    const jsdocCsTypes = property.keywords.filter(kw => kw.name === 'cstype');
    const jsdocCsType = jsdocCsTypes && jsdocCsTypes.length > 0 ? jsdocCsTypes[0] : null;

    if (jsdocCsType) {
        const RE_JSDOC_TYPE = /(?:{([^}]*)})?(.*)/gim;
        const m = RE_JSDOC_TYPE.exec(jsdocCsType.description);

        if (m) {
            return m[1];
        }
    }

    // Try to parse JS type and map to CS sharp type
    const jsdocTypes = property.keywords.filter(kw => kw.name === 'type');
    const jsdocType = jsdocTypes && jsdocTypes.length > 0 ? jsdocTypes[0] : null;

    if (jsdocType) {
        const RE_JSDOC_TYPE = /(?:{([^}]*)})?(.*)/gim;
        const m = RE_JSDOC_TYPE.exec(jsdocType.description);

        if (m) {
            return mapJSTypeToCSharp(m[1]);
        }
    }

    // Try to parse node value
    if (property.value !== null) {
        return mapJSPropertyValueToCSharpType(property.value);
    }

    // As a fallback, just use an generic object
    return 'object';
}

function buildViewModel(options, configuration, compilation) {
    const componentDoc = BuildUtils.getCompilationEntrypointData(compilation, configuration.location.name, '_entryPointComponentDoc');
    const dataProperties = componentDoc.data.filter(property => property.visibility === 'public');

    if (dataProperties.length === 0) {
        return null;
    }

    const propertyTemplate = `{{comment}}        public {{type}} {{name}} { get; set; }\n\n`;

    let propertiesContent = '';

    dataProperties.forEach((property) => {
        propertiesContent = propertiesContent + BuildUtils.replaceTemplatePlaceholders(
            propertyTemplate,
            {
                'type': getPropertyType(property),
                'name': property.name,
                'comment': property.description ? `        /// <summary>\n        /// ${property.description}\n        /// </summary>\n` : ''
            }
        );
    });

    const classTemplate = `
// **********************************
//     AUTOGENERATED FILE!!!
//     PLEASE DO NOT TOUCH THIS!!!
// **********************************
// ReSharper disable InconsistentNaming

namespace {{namespace}} {
    {{comment}}
    public class {{className}} {
        {{properties}}
    }

}
    `;

    return BuildUtils.replaceTemplatePlaceholders(
        classTemplate.trim(),
        {
            'className': `${configuration.location.page}ViewModel`,
            'namespace': buildOutputFileName(options.modelNamespace, configuration),
            'properties': propertiesContent.trim(),
            'comment': componentDoc.description ? `\n    /// <summary>\n    /// ${componentDoc.description}\n    /// </summary>` : ''
        }
    );
}

function normalizeNamePart(namePart) {
    return namePart.charAt(0).toUpperCase() + namePart.substr(1);
}

function buildOutputFileName(filename, entryConfiguration) {
    return filename
        .replace('[name]', entryConfiguration.location.name)
        .replace('[area]', normalizeNamePart(entryConfiguration.location.area))
        .replace('[page]', normalizeNamePart(entryConfiguration.location.page));
}

function mergeSetValuesFromDependentModules(entry, fieldName) {
    const result = new Set();

    Array.from(entry.runtimeChunk._modules).forEach(dependentModule => {
        if (dependentModule && dependentModule[fieldName]) {
            Array.from(dependentModule[fieldName]).forEach(term => {
                result.add(term);
            });
        }
    });

    return result;
}

AwesomeCshtmlPlugin.prototype.apply = function (compiler) {
    compiler.plugin('emit', (compilation, callback) => {
        try {
            let allReady = true;

            compilation.entrypoints.forEach((entry, entrypointName) => {
                allReady = allReady &&
                    (BuildUtils.getCompilationEntrypointData(compilation, entrypointName, '_entryPointComponentDoc') !== undefined);
            });

            if (!allReady) {
                callback();

                return;
            }

            compilation.entrypoints.forEach((entry, entrypointName) => {
                const localization = mergeSetValuesFromDependentModules(entry, '_languageTerms');
                const contextItems = mergeSetValuesFromDependentModules(entry, '_contextItems');

                const entryConfiguration = {
                    view: compilation._viewSettings.get(entrypointName),
                    location: BuildUtils.parseEntryPointName(entrypointName)
                };

                const csModelContent = buildViewModel(this.options, entryConfiguration, compilation);

                if (csModelContent != null) {
                    const outputFilePath = buildOutputFileName(this.options.modelFilename, entryConfiguration);

                    compilation.assets[outputFilePath] = {
                        source: () => csModelContent,
                        size: () => csModelContent.length
                    };

                    if (this.options.vsprojFilename) {
                        VSProjUtils.addFileToVSProject(
                            path.resolve(this.options.vsprojFilename),
                            path.resolve(compiler.outputPath, outputFilePath),
                            VSProjUtils.FILE_TYPE_COMPILE
                        );
                    }
                }

                const cshtmlContent = buildCshtmlViewPage(this.options, entryConfiguration, compilation, localization, contextItems, csModelContent != null);

                if (cshtmlContent != null) {
                    const outputFilePath = buildOutputFileName(this.options.filename, entryConfiguration);

                    compilation.assets[outputFilePath] = {
                        source: () => cshtmlContent,
                        size: () => cshtmlContent.length
                    };

                    if (this.options.vsprojFilename) {
                        VSProjUtils.addFileToVSProject(
                            path.resolve(this.options.vsprojFilename),
                            path.resolve(compiler.outputPath, outputFilePath),
                            VSProjUtils.FILE_TYPE_CONTENT
                        );
                    }
                }
            });

            callback();
        } catch (error) {
            callback(error);
        }
    });
};

module.exports = AwesomeCshtmlPlugin;
