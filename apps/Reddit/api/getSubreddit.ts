import { NextApiRequest } from 'next';
import { Subreddit as SnoowrapSubreddit } from 'snoowrap';
import { Subreddit } from '../interfaces/Subreddit';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getSubreddit(req: NextApiRequest): Promise<Subreddit> {
  const subreddit = (await (getSnoowrapInstance()
    .getSubreddit(req.query.subreddit as string)
    .fetch() as any)) as SnoowrapSubreddit;

  return {
    iconSrc: subreddit.icon_img || undefined,
  };
}
