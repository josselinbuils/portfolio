import Snoowrap from 'snoowrap';
import { config } from '~/platform/api/config';

const USER_AGENT = 'Portfolio by Josselin Buils';
let snoowrap: Snoowrap;

export function getSnoowrapInstance(): Snoowrap {
  if (snoowrap === undefined) {
    const { clientId, clientSecret, password, username } = config.reddit;

    snoowrap = new Snoowrap({
      userAgent: USER_AGENT,
      clientId,
      clientSecret,
      username,
      password,
    });
  }
  return snoowrap;
}
