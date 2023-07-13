import { createContext } from 'preact/compat';

export const InjectorContext = createContext<{ [name: string]: any }>({});
