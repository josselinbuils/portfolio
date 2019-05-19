export function stopWsClient(ws: WebSocket | undefined): void {
  if (ws !== undefined && ws.readyState < ws.CLOSING) {
    ws.close();
  }
}
