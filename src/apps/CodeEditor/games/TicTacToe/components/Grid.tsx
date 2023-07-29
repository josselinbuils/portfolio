import { type FC, type PropsWithChildren } from 'preact/compat';

export const Grid: FC<PropsWithChildren> = ({ children }) => (
  <svg fill="#29b9ad" stroke="#29b9ad" strokeWidth={2} viewBox="0 0 184 184">
    <path d="m 60 2 v 180" />
    <path d="m 122 2 v 180" />
    <path d="m 2 60 h 180" />
    <path d="m 2 122 h 180" />
    {children}
  </svg>
);
