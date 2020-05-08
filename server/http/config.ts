import { validate } from 'jsonschema';
import path from 'path';
import configSchema from './config.schema.json';

const rawConfig = require(path.join(process.cwd(), 'config.json')) as Config;
export const config = validate(rawConfig, configSchema, { throwError: true })
  .instance as Config;

interface Config {
  jamendo: {
    clientId: string;
  };
  reddit: {
    clientId: string;
    clientSecret: string;
    password: string;
    username: string;
  };
}
