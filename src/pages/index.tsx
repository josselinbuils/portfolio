import { type FC } from 'preact/compat';
import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { OperatingSystem } from '@/platform/components/OperatingSystem';

const IndexPage: FC = () => (
  <OperatingSystem
    defaultApp={{
      appDescriptor: TerminalDescriptor,
      windowComponent: Terminal,
    }}
  />
);

export default IndexPage;
