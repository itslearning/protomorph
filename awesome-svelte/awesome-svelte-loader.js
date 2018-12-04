const BuildUtils = require('./build-utils');
const LoaderUtils = require('loader-utils');
const sveltedoc = require('sveltedoc-parser');

const path = require('path');
const VirtualModules = require('svelte-loader/lib/virtual');

const inlineScriptRegex = /\{((([^}`'"]*)|`[^`]*`|'[^']*'|"[^"]*")*)\}|(on:[^=]+=("[^"]*"|'[^']*'))/giu;

const languageTermRegex = /(?:\bthis\.)?\$\$lang\.((__)\(('[^']*'|"[^"]*"|`[^`]*`|[^)]*)\)|[\w\d]+[_\w\d]*)(\(?)/gui;
const contextRegex = /(?:\bthis\.)?\$\$context\.([\w\d]+[_\w\d]*)/gui;

const __defaultLoaderOptions = {
    extensions: [],
    contextItemValidator: null, // callback(itemName: string): boolean
};

function extractContentFromHtmlBlock(content, blockName) {
    let pureContent = content;
    let innerBlockContent = '';
    let attributes = '';

    const blockStart = pureContent.indexOf(`<${blockName}`);

    if (blockStart >= 0) {
        const blockEnd = pureContent.indexOf(`</${blockName}>`, blockStart + blockName.length + 1);

        if (blockEnd >= 0) {
            const openTagEndIndex = pureContent.indexOf('>', blockStart + blockName.length);

            attributes = pureContent.substr(blockStart + blockName.length + 1, openTagEndIndex - blockStart - blockName.length - 1);
            innerBlockContent = pureContent.substr(openTagEndIndex + 1, blockEnd - openTagEndIndex - 1);

            pureContent = pureContent.substr(0, blockStart) + pureContent.substr(blockEnd + blockName.length + 3);
        }
    }

    return {
        content: pureContent,
        innerContent: innerBlockContent,
        attributes: attributes
    };
}

function injectCodeBlockToSveltePart(scriptBlockCode, partName, injectingCode) {
    if (scriptBlockCode != null && scriptBlockCode.length > 0) {
        const exportDefaultMatch = /\bexport[\s\n\t\r]+default[\s\n\t\r]+\{/gi.exec(scriptBlockCode);

        if (exportDefaultMatch != null) {
            const startIndex = exportDefaultMatch.index;
            const part = scriptBlockCode.substr(startIndex);

            const svelteBlockRegex = new RegExp(`\\b${partName}[\\s\\n\\t\\r]*:[\\s\\n\\t\\r]*{`, 'gi');
            const blockMatch = svelteBlockRegex.exec(part);

            if (blockMatch != null) {
                const injectionIndex = startIndex + blockMatch.index + blockMatch[0].length;

                scriptBlockCode = `${scriptBlockCode.substr(0, injectionIndex)} ${injectingCode}, ${scriptBlockCode.substr(injectionIndex)}`;
            } else {
                const injectionIndex = startIndex + exportDefaultMatch[0].length;

                scriptBlockCode = `${scriptBlockCode.substr(0, injectionIndex)} ${partName}: { ${injectingCode} }, ${scriptBlockCode.substr(injectionIndex)}`;
            }
        } else {
            scriptBlockCode = `${scriptBlockCode} export default { ${partName}: { ${injectingCode} } }`;
        }
    } else {
        scriptBlockCode = `
export default {
${partName}: { 
    ${injectingCode}
 }
}
`;
    }

    return scriptBlockCode;
}

function buildCodeToInjectHelpers(helpers) {
    return helpers.join(', ');
}

function preprocessSvelteMarkup(content, options, context) {
    // Split svelte file to three key blocks
    //  - HTML markup
    //  - JS logic
    //  - Styles
    let pureMarkupContent = content;

    const scriptBlock = extractContentFromHtmlBlock(pureMarkupContent, 'script');

    pureMarkupContent = scriptBlock.content;

    const styleBlock = extractContentFromHtmlBlock(pureMarkupContent, 'style');

    pureMarkupContent = styleBlock.content;

    if (path.resolve(context.filename) === path.join(context.dir, context.viewSettings.entry)) {
        // Is an entry component, we should extract data
        sveltedoc.parse({
            fileContent: content
        }).then(component => {
            BuildUtils.addCompilationEntrypointData(context.compilation, context.entryPointName, '_entryPointComponentDoc', () => {
                return component;
            });
        }).catch(error => {
            console.log(error);
        });
    }

    const helpersToInjection = [];
    const localLanguageTerms = [];
    const localContextItems = [];

    // Handle localization preprocessing function
    const handleLanguageTerm = function (match, termName, debugKeyword, debugPlaceholderText, functionOpenBracet) {
        const isFunction = functionOpenBracet === '(';
        const isDebug = debugKeyword === '__';

        localLanguageTerms.push(isDebug
            ? {
                isFunction: isFunction,
                isDebug: true,
                text: debugPlaceholderText
            }
            : {
                name: termName,
                isFunction: isFunction,
                isDebug: false
            });

        return (isDebug ? debugPlaceholderText : 'window.svelteLanguage.' + termName) + (isFunction ? '.format(' : '');
    };

    // Handle context preprocessing function
    const handleContext = function (match, name) {
        localContextItems.push(name);
        context.contextItemsManager.add(name);

        return 'window.svelteContext.' + name;
    };

    // Process language terms in inline HTML tags
    const markupContent = pureMarkupContent.replace(inlineScriptRegex, function (match) {
        return match.replace(languageTermRegex, handleLanguageTerm).replace(contextRegex, handleContext);
    });

    if (localContextItems.length > 0 || localLanguageTerms.filter(i => !i.isDebug).length > 0) {
        helpersToInjection.push('window');
    }

    // Process language terms in script block
    scriptBlock.innerContent = scriptBlock.innerContent
        .replace(languageTermRegex, handleLanguageTerm)
        .replace(contextRegex, handleContext);

    if (localLanguageTerms.length > 0) {
        localLanguageTerms.forEach((term) => {
            if (term.isDebug) {
                console.warn('\x1b[33m\x1b[1m%s\x1b[0m', `WARNING! Debug language term with text ${term.text} are found in "${context.filename}"`);
            } else {
                context.languageTermsManager.add(term.name);
                context.module._languageTerms.add(term.name);
            }
        });
    }

    if (localContextItems.length > 0 && options.contextItemValidator) {
        localContextItems.forEach((contextItem) => {
            if (!options.contextItemValidator(contextItem)) {
                console.warn('\x1b[33m\x1b[1m%s\x1b[0m', `WARNING! Not allowed context item ${contextItem} are found in "${context.filename}"`);
            }
        });
    }

    if (helpersToInjection.length > 0) {
        scriptBlock.innerContent = injectCodeBlockToSveltePart(scriptBlock.innerContent, 'helpers', buildCodeToInjectHelpers(helpersToInjection));
    }

    // Process extensions
    if (options.extensions && options.extensions.length > 0) {
        let extensionContent = {
            scriptBlock,
            styleBlock
        };

        options.extensions.forEach((extensionItem) => {
            extensionContent = extensionItem.instance(extensionContent, context, extensionItem.options);
        });

        // Unpack extension changes
        scriptBlock.innerContent = extensionContent.scriptBlock.innerContent;
        styleBlock.innerContent = extensionContent.styleBlock.innerContent;
    }

    return {
        code: `
${markupContent}

<style${styleBlock.attributes}>
${styleBlock.innerContent}
</style>

<script${scriptBlock.attributes}>
${scriptBlock.innerContent}
</script>
        `
    };
}

const virtualModuleInstances = new Map();

module.exports = function (source) {
    try {
        const options = Object.assign(
            {},
            __defaultLoaderOptions,
            LoaderUtils.getOptions(this)
        );

        if (this._compiler && !virtualModuleInstances.has(this._compiler)) {
            virtualModuleInstances.set(this._compiler, new VirtualModules(this._compiler));
        }

        const entryModule = BuildUtils.findEntryModule(this._module);
        const entryPointName = BuildUtils.extractEntryPointNameFromFile(entryModule.rawRequest, path.basename(this.rootContext));

        const filename = path.relative(this.rootContext, this.resource);
        const compilation = this._compilation;

        const virtualModules = virtualModuleInstances.get(this._compiler);

        const viewSettings = compilation._viewSettings.get(entryPointName);

        this._module._languageTerms = new Set();
        this._module._contextItems = new Set();

        const context = {
            filename: filename,
            entryPointName: entryPointName,
            dir: entryModule.context,
            root: this.rootContext,
            virtualModules: virtualModules,
            module: this._module,
            compilation: compilation,
            languageTermsManager: this._module._languageTerms,
            contextItemsManager: this._module._contextItems,
            viewSettings: viewSettings
        };

        const result = preprocessSvelteMarkup(source, options, context);

        this.callback(null, result.code, result.map);
    } catch (error) {
        this.callback(new Error(error.message));
    }
};
