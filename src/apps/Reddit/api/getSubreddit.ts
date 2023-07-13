import { type Request } from 'express';
import { type Subreddit as SnoowrapSubreddit } from 'snoowrap';
import { type Subreddit } from '../interfaces/Subreddit';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getSubreddit(req: Request): Promise<Subreddit> {
  const subreddit = (await (getSnoowrapInstance()
    .getSubreddit(req.params.subreddit as string)
    .fetch() as any)) as SnoowrapSubreddit;

  return {
    iconSrc: subreddit.icon_img || undefined,
  };
}
