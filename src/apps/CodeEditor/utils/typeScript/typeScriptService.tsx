import { Deferred } from '@josselinbuils/utils/Deferred';
import { type SymbolDisplayPart } from 'typescript';
import { createGUID } from '@/platform/utils/createGUID';
import { type LanguageService } from '../../interfaces/LanguageService';
import { highlightCode } from '../highlightCode/highlightCode';
import {
  type WorkerAction,
  type WorkerActionArgs,
  type WorkerActionGenericHandler,
  type WorkerActionType,
  type WorkerResponse,
  type WorkerResponseResult,
} from './interfaces';
import {
  type GetQuickInfoActionHandler,
  type LintActionHandler,
  type TranspileActionHandler,
  type WorkerActionHandler,
} from './tsWorker';

const worker = new Worker(new URL('./tsWorker.ts', import.meta.url), {
  type: 'module',
});
const deferredMap = new Map<string, Deferred<any>>();

async function exec<Handler extends WorkerActionGenericHandler>(
  type: WorkerActionType<Handler>,
  ...args: WorkerActionArgs<Handler>
): Promise<WorkerResponseResult<Handler>> {
  const uuid = createGUID();
  const deferred = new Deferred();

  deferredMap.set(uuid, deferred);
  worker.postMessage({
    args,
    type,
    uuid,
  } satisfies WorkerAction<Handler>);

  return deferred.promise;
}

worker.addEventListener(
  'message',
  ({ data }: MessageEvent<WorkerResponse<WorkerActionHandler>>) => {
    const { result, uuid } = data;

    if (deferredMap.has(uuid)) {
      deferredMap.get(uuid)!.resolve(result);
      deferredMap.delete(uuid);
    } else {
      console.error(`Unknown uuid ${uuid} received with result`, result);
    }
  },
);

const mergeParts = (parts: SymbolDisplayPart[] | undefined) =>
  parts?.map((part) => part.text).join('') ?? '';

export const typeScriptService: LanguageService = {
  getQuickInfo: async (code, cursorOffset) => {
    const quickInfo = await exec<GetQuickInfoActionHandler>(
      'getQuickInfo',
      code,
      cursorOffset,
    );

    if (quickInfo === undefined) {
      return undefined;
    }

    const { displayParts, documentation } = quickInfo;

    const body = mergeParts(documentation);

    return (
      <>
        <section>
          {highlightCode(mergeParts(displayParts), 'typescript', 'react')}
        </section>
        {body && <section style={{ marginTop: '1rem' }}>{body}</section>}
      </>
    );
  },
  lint: async (code) => exec<LintActionHandler>('lint', code),
  transpile: async (code) => exec<TranspileActionHandler>('transpile', code),
};
