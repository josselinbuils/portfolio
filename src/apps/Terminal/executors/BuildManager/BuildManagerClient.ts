import { Deferred } from '@josselinbuils/utils';
import { PROD_HOSTNAME } from '~/platform/constants';
import { noop } from '~/platform/utils';

export enum MessageType {
  Command = 'command',
  Error = 'error',
  Info = 'info',
  Logs = 'logs',
}

export class BuildManagerClient {
  private closeHandler = noop as () => void;
  private errorHandler = noop as (errorMessage?: string) => void;
  private messageHandler = noop as (message: Message) => void;
  private readonly readyDeferred = new Deferred<BuildManagerClient>();
  private readonly ws: WebSocket;

  constructor() {
    const ws = new WebSocket(`wss://${PROD_HOSTNAME}/build-manager`);

    ws.onclose = () => this.closeHandler();

    ws.onerror = () => {
      this.readyDeferred.reject();
      this.errorHandler();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Message;

        if (message.type === MessageType.Error) {
          this.errorHandler(message.value);
        } else {
          this.messageHandler(message);
        }
      } catch (error) {
        this.errorHandler();
      }
    };

    ws.onopen = () => this.readyDeferred.resolve(this);

    this.ws = ws;
  }

  onClose(closeHandler: () => void): BuildManagerClient {
    this.closeHandler = closeHandler;
    return this;
  }

  onError(errorHandler: (errorMessage?: string) => void): BuildManagerClient {
    this.errorHandler = errorHandler;
    return this;
  }

  onMessage(messageHandler: (message: Message) => void): BuildManagerClient {
    this.messageHandler = messageHandler;
    return this;
  }

  send(type: MessageType, value: any): BuildManagerClient {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify({ type, value }));
    }
    return this;
  }

  stop(): void {
    if (this.ws.readyState < this.ws.CLOSING) {
      this.ws.close();
    }
  }

  async waitUntilReady(): Promise<BuildManagerClient> {
    return this.readyDeferred.promise;
  }
}

interface Message {
  type: MessageType;
  value: any;
}
