const fs = require('fs');
const path = require('path');
const etree = require('elementtree');

const FILE_TYPE_COMPILE = 'Compile';
const FILE_TYPE_CONTENT = 'Content';

const SUPPORTED_FILE_TYPES = [
    FILE_TYPE_COMPILE, FILE_TYPE_CONTENT
];

/**
 * Add the reference file into VS project file.
 * @param {string} projectFilePath The path to the project file.
 * @param {string} fileReference The path to file that should be included
 * @param {string} fileType The file type that should be included into project file, @see FILE_TYPE_COMPILE @see FILE_TYPE_CONTENT
 * @returns Flag, which indicating that file was added or not into project file.
 */
const addFileToVSProject = function (projectFilePath, fileReference, fileType) {
    if (!fs.existsSync(projectFilePath)) {
        throw new Error(`Project file "${projectFilePath}" are not exists`);
    }

    if (SUPPORTED_FILE_TYPES.indexOf(fileType) === -1) {
        throw new Error(`File type "${fileType}" is not supported to adding into project file`);
    }

    const projectDirectory = path.dirname(projectFilePath);

    let relativeFilePath = path.relative(projectDirectory, fileReference);

    if (relativeFilePath.charAt(0) === '\\') {
        relativeFilePath = relativeFilePath.substr(1);
    }

    const projectFileContent = fs.readFileSync(projectFilePath).toString();

    const xml = etree.parse(projectFileContent);

    const fileEntries = xml.findall(`./ItemGroup/${fileType}[@Include='${relativeFilePath}']`);

    if (fileEntries.length > 0) {
        // File already included at proj file
        return false;
    }

    let updatedFileContent = projectFileContent;

    // File is not included we should insert new entry
    const itemGroupIndex = projectFileContent.lastIndexOf('<ItemGroup');

    if (itemGroupIndex > 0) {
        const itemGroupCloseIndex = projectFileContent.indexOf('</ItemGroup>', itemGroupIndex);

        if (itemGroupCloseIndex > itemGroupIndex) {
            const itemToInclude = `  <${fileType} Include="${relativeFilePath}" />\n  `;

            updatedFileContent = projectFileContent.substr(0, itemGroupCloseIndex) +
                itemToInclude +
                projectFileContent.substr(itemGroupCloseIndex);
        }
    } else {
        // If ItemGroup block is not defined into project we should create new one
        // TODO
        console.warn('\x1b[33m\x1b[1m%s\x1b[0m', `WARNING! Project file "${projectFilePath}" don't have any ItemGroup sections. Now this case is not supported.`);
    }

    fs.writeFileSync(projectFilePath, updatedFileContent, null);

    return true;
};

module.exports = {
    FILE_TYPE_COMPILE,
    FILE_TYPE_CONTENT,

    addFileToVSProject
};
