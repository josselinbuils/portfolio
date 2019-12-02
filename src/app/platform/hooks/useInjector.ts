import { createContext, useContext } from 'react';

const InjectorContext = createContext<{ [name: string]: any }>({});

export function useInjector<T>(
  singletonCLass: (new () => T) & { injectionId: string }
): T {
  const injectorStore = useContext(InjectorContext);
  const name = singletonCLass.injectionId;

  if (injectorStore[name] === undefined) {
    injectorStore[name] = new singletonCLass();
  }
  return injectorStore[name] as T;
}
