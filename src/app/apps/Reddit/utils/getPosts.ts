import { BASE_URL } from '~/platform/constants';

export async function getPosts(path: string) {
  const response = await fetch(`${BASE_URL}/api/reddit/${path}`);
  return response.json();
}
