/// <reference types="vite/client" />

import { type AriaAttributes, type DOMAttributes } from 'react';

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}
