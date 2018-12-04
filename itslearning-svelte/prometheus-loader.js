const path = require('path');
const fs = require('fs');
const BuildUtils = require('../awesome-svelte/build-utils');

const prometheusComponentRegex = /'@itslearning\/prometheus\/assets\/[^']*\.svelte'|"@itslearning\/prometheus\/assets\/[^"]*\.svelte"/gui;

function normalizeSvelteComponentName(componentPath) {
    return componentPath.replace(/(\.svelte)|(['"]*)/gi, '');
}

function getSvelteComponentStylesFilePath(componentName) {
    return `${componentName}.scss`;
}

function buildSvelteComponentStylesFile(options, componentName) {
    const template = fs.readFileSync(options.templateFilename);

    return BuildUtils.replaceTemplatePlaceholders(
        template.toString(),
        {
            'componentName': componentName
        }
    );
}

module.exports = function (content, context, options) {
    const componentsToImport = new Set();

    // Handle imports to prometheus components
    let prometheusComponentMatch = prometheusComponentRegex.exec(content.scriptBlock.innerContent);

    while (prometheusComponentMatch !== null) {
        const componentName = normalizeSvelteComponentName(prometheusComponentMatch[0]);

        componentsToImport.add(componentName);
        prometheusComponentMatch = prometheusComponentRegex.exec(content.scriptBlock.innerContent);
    }

    // Import required to prometheus component styles
    componentsToImport.forEach((componentName) => {
        const componentFileName = getSvelteComponentStylesFilePath(componentName);
        const componentStylesFilePath = path.join(context.root, componentFileName);

        context.virtualModules.writeModule(componentStylesFilePath, buildSvelteComponentStylesFile(options, componentName));

        content.scriptBlock.innerContent = `import '${componentStylesFilePath.replace(/\\/g, '\\\\')}';\r\n${content.scriptBlock.innerContent}`;
    });

    return content;
};
