import { lazy as reactLazy } from 'preact/compat';

export function lazy<T>(factory: () => Promise<T>): T {
  return reactLazy(async () => ({ default: await factory() }));
}
