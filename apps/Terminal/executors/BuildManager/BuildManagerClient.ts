import { Deferred } from '@josselinbuils/utils/Deferred';
import { PROD_HOSTNAME } from '~/platform/constants';
import { noop } from '~/platform/utils/noop';

const RETRY_DELAY_MS = 2000;

export enum MessageType {
  AuthToken = 'authToken',
  Command = 'command',
  Error = 'error',
  Logs = 'logs',
  Success = 'success',
}

export class BuildManagerClient {
  private closeHandler = noop as () => void;
  private errorHandler = noop as (error: unknown) => void;
  private messageHandler = noop as (message: BMMessage) => void;
  private readonly readyDeferred = new Deferred<BuildManagerClient>();
  private readonly ws: WebSocket;
  private retryTimeout?: number;

  constructor() {
    const ws = new WebSocket(`wss://${PROD_HOSTNAME}/build-manager`);

    ws.onclose = () => {
      this.clearRetryTimeout();
      this.closeHandler();
    };

    ws.onerror = (event) => {
      this.clearRetryTimeout();
      this.readyDeferred.reject();
      this.errorHandler(event);
    };

    ws.onmessage = (event) => {
      this.clearRetryTimeout();

      try {
        const message = JSON.parse(event.data) as BMMessage;

        if (message.type === MessageType.Error) {
          this.errorHandler(message.value);
        } else {
          this.messageHandler(message);
        }
      } catch (error) {
        this.errorHandler(error);
      }
    };

    ws.onopen = () => this.readyDeferred.resolve(this);

    this.ws = ws;
  }

  onClose(closeHandler: () => void): BuildManagerClient {
    this.closeHandler = closeHandler;
    return this;
  }

  onError(errorHandler: (error: unknown) => void): BuildManagerClient {
    this.errorHandler = errorHandler;
    return this;
  }

  onMessage(messageHandler: (message: BMMessage) => void): BuildManagerClient {
    this.messageHandler = messageHandler;
    return this;
  }

  send(type: MessageType, value: any): BuildManagerClient {
    if (this.ws.readyState === this.ws.OPEN) {
      const message = JSON.stringify({ type, value });
      this.ws.send(message);
      this.clearRetryTimeout();
      this.retryTimeout = window.setTimeout(
        () => this.ws.send(message),
        RETRY_DELAY_MS
      );
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

  private clearRetryTimeout(): void {
    if (this.retryTimeout !== undefined) {
      window.clearTimeout(this.retryTimeout);
      delete this.retryTimeout;
    }
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
