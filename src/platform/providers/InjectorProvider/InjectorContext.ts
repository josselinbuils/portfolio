import { createContext } from 'react';

export const InjectorContext = createContext<{ [name: string]: any }>({});
