import { HTTP_PREFIX } from '~/platform/constants';

export async function getPosts(path: string) {
  const response = await fetch(`${HTTP_PREFIX}/api/reddit${path}`);
  return response.json();
}
