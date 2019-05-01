const DicomController = require('./dicom.controller');
const Logger = require('../../logger');

module.exports = class DependenciesRoutes {
  static init(router) {
    Logger.info('Initializes dicom routes');
    // DicomController.init();
    router.get('/api/dicom', DicomController.getList);
  }
};
