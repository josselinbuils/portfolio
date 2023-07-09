import { type NextApiRequest } from 'next';
import { type Subreddit as SnoowrapSubreddit } from 'snoowrap';
import { type Subreddit } from '../interfaces/Subreddit';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getSubreddit(req: NextApiRequest): Promise<Subreddit> {
  const subreddit = (await (getSnoowrapInstance()
    .getSubreddit(req.query.subreddit as string)
    .fetch() as any)) as SnoowrapSubreddit;

  return {
    iconSrc: subreddit.icon_img || undefined,
  };
}
