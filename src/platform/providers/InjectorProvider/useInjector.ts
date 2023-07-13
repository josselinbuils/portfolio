import { useContext } from 'preact/compat';
import { InjectorContext } from './InjectorContext';

export function useInjector<T>(
  SingletonCLass: (new () => T) & { injectionId: string },
  init?: (instance: T) => unknown,
): T {
  const injectorStore = useContext(InjectorContext);
  const name = SingletonCLass.injectionId;

  if (injectorStore[name] === undefined) {
    injectorStore[name] = new SingletonCLass();
    init?.(injectorStore[name] as T);
  }
  return injectorStore[name] as T;
}
