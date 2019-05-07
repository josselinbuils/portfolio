import express from 'express';
import SourceMapSupport from 'source-map-support';
import { ENV_DEV, PORT } from './constants';
import { Logger } from './Logger';
import { registerRouter } from './registerRouter';

const ENV = process.env.NODE_ENV || ENV_DEV;

Logger.info(`Start portfolio server in ${ENV} mode`);

SourceMapSupport.install();

const app = registerRouter(express());

app.listen(PORT, () => Logger.info(`Server is listening on port ${PORT}`));
