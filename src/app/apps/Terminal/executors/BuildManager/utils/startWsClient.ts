export function startWsClient<T>(
  messageHandler: (message: T) => void,
  errorHandler: () => void
): WebSocket {
  const hostname = window.location.hostname;
  const wsInstance = new WebSocket(`wss://${hostname}/build-manager`);

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
