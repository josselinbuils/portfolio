const express = require('express');

const { ENV_DEV, PORT } = require('./constants.json');
const Logger = require('./logger');
const Router = require('./router');

const ENV = process.env.NODE_ENV || ENV_DEV;

const app = express();

Logger.info(`Start portfolio server in ${ENV} mode`);

Router.init(app);

app.listen(PORT, () => Logger.info(`Server is listening on port ${PORT}`));
