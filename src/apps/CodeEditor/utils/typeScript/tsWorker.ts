import { type LintIssue } from '../../components/Editor/components/LintIssue/LintIssue';
import { checkTypes } from './checkTypes';
import { createLanguageService } from './createLanguageService';
import {
  type WorkerAction,
  type WorkerActionGenericHandler,
  type WorkerResponse,
  type WorkerResponseResult,
} from './interfaces';

export type CheckTypesActionHandler = WorkerActionGenericHandler<
  'checkTypes',
  [string],
  LintIssue[]
>;

export type TranspileActionHandler = WorkerActionGenericHandler<
  'transpile',
  [string],
  string
>;

export type WorkerActionHandler =
  | CheckTypesActionHandler
  | TranspileActionHandler;

onmessage = ({
  data: action,
}: MessageEvent<WorkerAction<WorkerActionHandler>>) => {
  const { args, type, uuid } = action;

  switch (type) {
    case 'checkTypes':
      sendWorkerResponse<CheckTypesActionHandler>(uuid, checkTypes(args[0]));
      break;

    case 'transpile':
      sendWorkerResponse<TranspileActionHandler>(
        uuid,
        createLanguageService(args[0]).transpile(),
      );
      break;

    default:
      console.error(`Unknown action: ${action}.`);
      break;
  }
};

function sendWorkerResponse<Handler extends WorkerActionGenericHandler>(
  uuid: string,
  result: WorkerResponseResult<Handler>,
) {
  postMessage({ result, uuid } satisfies WorkerResponse<Handler>);
}
