import { useContext } from 'react';
import { InjectorContext } from './InjectorContext';

export function useInjector<T>(
  SingletonCLass: (new () => T) & { injectionId: string }
): T {
  const injectorStore = useContext(InjectorContext);
  const name = SingletonCLass.injectionId;

  if (injectorStore[name] === undefined) {
    injectorStore[name] = new SingletonCLass();
  }
  return injectorStore[name] as T;
}
