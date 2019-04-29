import { EventHandler, SyntheticEvent } from 'react';
import { noop } from './noop';

export function decorateHandler(
  handler: EventHandler<any>,
  originalEventHandler: EventHandler<any> = noop
): EventHandler<any> {
  return function(this: typeof originalEventHandler, event: SyntheticEvent) {
    handler.call(this, event);
    originalEventHandler.call(this, event);
  };
}
