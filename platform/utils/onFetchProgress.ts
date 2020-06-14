import { throttle } from '~/platform/utils/throttle';

export function onFetchProgress(
  onProgress: (progress: number) => void
): (response: Response) => Response {
  const onProgressThrottled = throttle(onProgress, 300);

  return function responseHandler(response: Response): Response {
    const contentLength =
      response.headers.get('content-length-uncompressed') ||
      response.headers.get('content-length');

    if (!contentLength) {
      throw Error('Unable to retrieve content-length header');
    }

    const totalBytes = parseInt(contentLength, 10);
    let loadedBytes = 0;

    return new Response(
      new ReadableStream({
        start(controller: ReadableStreamDefaultController): void {
          if (response.body === null) {
            throw Error('Unable to retrieve readable stream');
          }

          const reader = response.body.getReader();

          function read(): void {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                if (value !== undefined) {
                  loadedBytes += value.byteLength;
                  onProgressThrottled(loadedBytes / totalBytes);
                  controller.enqueue(value);
                }
                read();
              })
              .catch((error) => controller.error(error));
          }
          read();
        },
      })
    );
  };
}
