import fs from 'node:fs';
import path from 'node:path';
import { validate } from 'jsonschema';
import configSchema from './config.schema.json';

const rawConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf8'),
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
