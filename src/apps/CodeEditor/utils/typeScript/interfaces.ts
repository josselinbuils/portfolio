export interface WorkerActionGenericHandler<
  Type extends string = string,
  Args extends any[] = any[],
  Result = unknown,
> {
  action: {
    args: Args;
    type: Type;
    uuid: string;
  };
  response: {
    result: Result;
    uuid: string;
  };
}

export type WorkerAction<Handler extends WorkerActionGenericHandler> =
  Handler['action'];

export type WorkerActionArgs<Handler extends WorkerActionGenericHandler> =
  Handler['action']['args'];

export type WorkerActionType<Handler extends WorkerActionGenericHandler> =
  Handler['action']['type'];

export type WorkerResponse<Handler extends WorkerActionGenericHandler> =
  Handler['response'];

export type WorkerResponseResult<Handler extends WorkerActionGenericHandler> =
  Handler['response']['result'];
