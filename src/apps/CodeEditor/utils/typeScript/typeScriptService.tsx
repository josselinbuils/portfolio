import { Deferred } from '@josselinbuils/utils/Deferred';
import { createGUID } from '@/platform/utils/createGUID';
import { type LanguageService } from '../../interfaces/LanguageService';
import {
  type WorkerAction,
  type WorkerActionArgs,
  type WorkerActionGenericHandler,
  type WorkerActionType,
  type WorkerResponse,
  type WorkerResponseResult,
} from './interfaces';
import { renderQuickInfo } from './renderQuickInfo';
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

export const typeScriptService: LanguageService = {
  getQuickInfo: async (code, cursorOffset) => {
    const quickInfo = await exec<GetQuickInfoActionHandler>(
      'getQuickInfo',
      code,
      cursorOffset,
    );
    return quickInfo !== undefined ? renderQuickInfo(quickInfo) : undefined;
  },
  lint: async (code) => exec<LintActionHandler>('lint', code),
  transpile: async (code) => exec<TranspileActionHandler>('transpile', code),
};

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
