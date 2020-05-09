import { Deferred } from '@josselinbuils/utils';
import { PROD_HOSTNAME } from '~/platform/constants';
import { noop } from '~/platform/utils/noop';

export enum MessageType {
  AuthToken = 'authToken',
  Command = 'command',
  Error = 'error',
  Logs = 'logs',
  Success = 'success',
}

export class BuildManagerClient {
  private closeHandler = noop as () => void;
  private errorHandler = noop as (error?: BMError) => void;
  private messageHandler = noop as (message: BMMessage) => void;
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
        const message = JSON.parse(event.data) as BMMessage;

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

  onError(errorHandler: (error?: BMError) => void): BuildManagerClient {
    this.errorHandler = errorHandler;
    return this;
  }

  onMessage(messageHandler: (message: BMMessage) => void): BuildManagerClient {
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

export interface BMError {
  code: number;
  message: string;
}

export interface BMMessage {
  type: MessageType;
  value: any;
}
