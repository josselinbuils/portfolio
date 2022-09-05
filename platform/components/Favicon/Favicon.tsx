import { FC } from 'react';
import favicon16 from './favicon16.png';
import favicon32 from './favicon32.png';

export const Favicon: FC = () => (
  <>
    <link rel="icon" type="image/png" sizes="16x16" href={favicon16.src} />
    <link rel="icon" type="image/png" sizes="32x32" href={favicon32.src} />
  </>
);
