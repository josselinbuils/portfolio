import { type FC } from 'preact/compat';
import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { OperatingSystem } from '@/platform/components/OperatingSystem';

export const Index: FC = () => (
  <OperatingSystem
    defaultApp={{
      appDescriptor: TerminalDescriptor,
      windowComponent: Terminal,
    }}
  />
);
