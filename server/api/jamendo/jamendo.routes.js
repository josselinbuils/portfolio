const JamendoController = require('./jamendo.controller');
const Logger = require('../../logger');

module.exports = class JamendoRoutes {
  static init(router) {
    Logger.info('Initializes jamendo routes');
    JamendoController.init();
    router.get('/api/jamendo/tracks/:order', JamendoController.getTracks);
    router.get('/api/jamendo/tracks/:tag/:order', JamendoController.getTracks);
  }
};
