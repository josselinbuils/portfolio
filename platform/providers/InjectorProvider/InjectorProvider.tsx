import { FC, useState } from 'react';
import { InjectorContext } from './InjectorContext';

export const InjectorProvider: FC = ({ children }) => {
  const [injectionMap] = useState({});

  return (
    <InjectorContext.Provider value={injectionMap}>
      {children}
    </InjectorContext.Provider>
  );
};
