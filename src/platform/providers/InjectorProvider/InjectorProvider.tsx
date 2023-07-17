import { type FC, type PropsWithChildren } from 'preact/compat';
import { useState } from 'preact/compat';
import { InjectorContext } from './InjectorContext';

export const InjectorProvider: FC<PropsWithChildren> = ({ children }) => {
  const [injectionMap] = useState({});

  return (
    <InjectorContext.Provider value={injectionMap}>
      {children}
    </InjectorContext.Provider>
  );
};
