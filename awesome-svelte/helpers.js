/**
 * Build context item validation function, which checks that specified `contextItem` are existing in allowed list.
 * @param {Array<string>} allowedContextItems The list of allowed contenxt items.
 * @returns {function({string}): {boolean}} The validation function, which checks that specified `contextItem` are existing in allowed list.
 */
function simpleListContextItemValidator(allowedContextItems) {
    return (contextItem) => {
        return allowedContextItems.indexOf(contextItem) >= 0;
    };
}

/**
 * Provide an svelte node-sass preprocess to support SASS syntax in svelte components.
 * @param {*} options The additional options for building svelte preprocessor.
 */
function svelteSassPreprocessor(options) {
    const sass = require('node-sass');
    const path = require('path');

    const validAttribyteTypes = ['text/scss', 'text/sass'];
    const validAttributeLangs = ['scss', 'sass'];

    function hasValidSassAttribute(attributes) {
        return validAttribyteTypes.indexOf(attributes.type) >= 0 ||
            validAttributeLangs.indexOf(attributes.lang) >= 0;
    }

    return async ({ content, attributes, filename }) => {
        if (!hasValidSassAttribute(attributes)) return;

        if (options && options.additionalImports && options.additionalImports.length > 0) {
            options.additionalImports.forEach(importFileName => {
                content = `@import "${importFileName}";\r\n${content}`;
            });
        }

        return new Promise((resolve, reject) => {
            sass.render(
                {
                    data: content,
                    sourceMap: true,
                    includePaths: ['node_modules', filename ? path.dirname(filename) : ''],
                    outFile: 'x', // this is necessary, but is ignored,
                    importer: function (url, prev, done) {
                        done({
                            file: url.replace('~', '')
                        });
                    }
                },
                (err, result) => {
                    if (err) return reject(err);

                    resolve({
                        code: result.css.toString(),
                        map: result.map.toString(),
                    });
                },
            );
        });
    };
}

module.exports = {
    simpleListContextItemValidator,
    svelteSassPreprocessor
};
