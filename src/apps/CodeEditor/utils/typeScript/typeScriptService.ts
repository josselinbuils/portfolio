import { Deferred } from '@josselinbuils/utils/Deferred';
import { createGUID } from '@/platform/utils/createGUID';
import { type LintIssue } from '../../components/Editor/components/LintIssue/LintIssue';

const worker = new Worker(new URL('./tsWorker.ts', import.meta.url), {
  type: 'module',
});
const deferredMap = new Map<string, Deferred<any>>();

async function exec<Result>(
  action: string,
  ...args: unknown[]
): Promise<Result> {
  const uuid = createGUID();
  const deferred = new Deferred<Result>();

  deferredMap.set(uuid, deferred);
  worker.postMessage({ action, args, uuid });

  return deferred.promise;
}

worker.addEventListener('message', ({ data }) => {
  const { result, uuid } = data;

  if (deferredMap.has(uuid)) {
    deferredMap.get(uuid)!.resolve(result);
    deferredMap.delete(uuid);
  } else {
    console.error(`Unknown uuid ${uuid} received with result`, result);
  }
});

async function checkTypes(code: string): Promise<LintIssue[]> {
  return exec('checkTypes', code);
}

async function transpile(code: string): Promise<string> {
  return exec('transpile', code);
}

export const typeScriptService = { checkTypes, transpile };
