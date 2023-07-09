import { computeHash } from '~/platform/utils/computeHash';
import {
  type ActionCreator,
  type ActionFactory,
} from '../interfaces/ActionFactory';

const isProduction = process.env.NODE_ENV === 'production';

export function createActionFactory<Payload = void>(
  type: string,
): ActionFactory<Payload> {
  const optimisedType = isProduction ? computeHash(type) : type;

  return {
    create: ((payload?: unknown) =>
      payload !== undefined
        ? [optimisedType, payload]
        : [optimisedType]) as ActionCreator<Payload>,
    type: optimisedType,
  };
}
