import fs from 'fs';
import { validate } from 'jsonschema';
import path from 'path';
import configSchema from './config.schema.json';

const rawConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8')
) as Config;
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
