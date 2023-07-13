import {
  lazy as reactLazy,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

export function lazy<T extends ComponentType<any>>(
  factory: () => Promise<T>,
): LazyExoticComponent<T> {
  return reactLazy(async () => ({ default: await factory() }));
}
