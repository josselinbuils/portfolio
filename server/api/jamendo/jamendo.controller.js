const request = require('request-promise-native');

const { jamendo } = require('../../config.json');
const { HTTP_INTERNAL_ERROR } = require('../../constants.json');
const Logger = require('../../logger');

module.exports = class JamendoController {
  static getTracks(req, res) {
    const tag = req.params.tag;
    const order = req.params.order;

    const options = { limit: 50 };

    if (tag) {
      options.tags = tag;
      options.boost = order;
    } else {
      options.order = order;
    }

    get('/tracks', options)
      .then(results => res.json(results))
      .catch(error => {
        Logger.error(error.stack);
        res.status(HTTP_INTERNAL_ERROR).end();
      });
  }

  static init() {
    validateConfig();
  }
};

function get(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      url: Object.keys(options).reduce(
        (url, key) => `${url}&${key}=${options[key]}`,
        `https://api.jamendo.com/v3.0${path}/?client_id=${
          jamendo.clientId
        }&format=json`
      ),
      json: true
    };

    Logger.info(`-> GET ${req.url}`);

    request(req)
      .then(data => {
        const headers = data.headers;

        if (headers.status === 'success') {
          resolve(data.results);
        } else {
          reject(
            Error(
              `Jamendo API error: code ${headers.code}: ${
                headers.error_message
              }`
            )
          );
        }
      })
      .catch(reject);
  });
}

function validateConfig() {
  if (!jamendo || !jamendo.clientId) {
    throw Error('Invalid configuration: jamendo');
  }
}
