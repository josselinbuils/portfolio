import { PROD_HOSTNAME } from '~/platform/constants';

export function startWsClient<T>(
  messageHandler: (message: T) => void,
  errorHandler: () => void
): WebSocket {
  const wsInstance = new WebSocket(`wss://${PROD_HOSTNAME}/build-manager`);

  wsInstance.onmessage = event => {
    try {
      const message = JSON.parse(event.data);
      messageHandler(message);
    } catch (error) {
      errorHandler();
    }
  };

  wsInstance.onerror = () => errorHandler();

  return wsInstance;
}
