const { dependencies } = require('../../../package.json');

module.exports = class DependenciesController {
  static getDependencies(req, res) {
    res.json(Object.keys(dependencies));
  }
};
