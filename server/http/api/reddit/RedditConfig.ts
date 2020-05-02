export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export function isRedditConfig(config: any): config is RedditConfig {
  return (
    config &&
    [
      config.clientId,
      config.clientSecret,
      config.username,
      config.password,
    ].every((field) => typeof field === 'string' && field.length > 0)
  );
}
