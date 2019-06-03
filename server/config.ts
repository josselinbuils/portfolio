import * as path from 'path';

const config = require(path.join(process.cwd(), 'config.json')) as Config;

export const jamendo = config.jamendo;
export const reddit = config.reddit;

interface Config {
  jamendo: {
    clientId: string;
  };
  reddit: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
  };
}
