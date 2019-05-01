const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const { ASSETS_DIR, ASSETS_DIR_DEV, ENV_DEV } = require('../../constants.json');
const Logger = require('../../logger');

const ENV = process.env.NODE_ENV || ENV_DEV;
const dicomPath = join(
  process.cwd(),
  ENV === ENV_DEV ? ASSETS_DIR_DEV : ASSETS_DIR,
  '/dicom'
);
const datasetsPath = join(dicomPath, '/datasets');
const previewsPath = join(dicomPath, '/previews');

let previews;
let datasetDescriptors;

module.exports = class DicomController {
  static getList(req, res) {
    if (ENV === ENV_DEV) {
      previews = readdirSync(previewsPath);
      datasetDescriptors = getDatasetDescriptors();
    }
    res.json(datasetDescriptors);
  }

  static init() {
    previews = readdirSync(previewsPath);
    datasetDescriptors = getDatasetDescriptors();
  }
};

function getDatasetDescriptors() {
  Logger.info(`Loads datasets from ${datasetsPath}`);

  return readdirSync(datasetsPath)
    .map(fileName => {
      const files = getFiles(datasetsPath, fileName);
      const name = fileName.replace(/(\.[a-z]+)+$/, '');
      const preview = previews.find(p => p.includes(name));
      // noinspection JSUnusedGlobalSymbols
      return { files, name, preview };
    })
    .filter(
      (descriptor, index, descriptors) =>
        descriptors.findIndex(d => d.name === descriptor.name) === index
    );
}

function getFiles(folderPath, name) {
  const path = join(folderPath, name);

  return lstatSync(path).isDirectory()
    ? readdirSync(path).map(
        fileName => `${name}/${fileName.replace('.gz', '')}`
      )
    : [name.replace('.gz', '')];
}
