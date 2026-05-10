import { type FunctionComponent } from 'preact';

import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { OperatingSystem } from '@/platform/components/OperatingSystem';

const IndexPage: FunctionComponent = () => (
  <OperatingSystem
    defaultApp={{
      appDescriptor: TerminalDescriptor,
      windowComponent: Terminal,
    }}
  />
);

export default IndexPage;
