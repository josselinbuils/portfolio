export function stopWsClient(ws: WebSocket | undefined) {
  if (ws !== undefined && ws.readyState < ws.CLOSING) {
    ws.close();
  }
}
