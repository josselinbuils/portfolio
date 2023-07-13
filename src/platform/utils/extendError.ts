export function extendError(prefix: string, error: unknown): Error {
  if (error instanceof Error) {
    error.message = `${prefix}: ${error.message}`;
    return error;
  }
  if (typeof error !== 'string') {
    console.error(error);
  }
  return new Error(`${prefix}: ${error}`);
}
