'use client';

import axios from 'axios';
import { getSameOriginHttpUrl, getSameOriginWebSocketUrl } from '../../lib/sameOrigin';

const BASE_URL = process.env.NEXT_PUBLIC_LOCAL_HOST_HA ?? getSameOriginHttpUrl('/api/ha');
const TOKEN = process.env.NEXT_PUBLIC_LONG_LIVE_THE_TOKEN;

export type HomeAssistantEntity = {
  entity_id: string;
  state: string;
  last_changed?: string;
  last_updated?: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    icon?: string;
    brightness?: number;
    temperature?: number;
    current_temperature?: number;
    hvac_action?: string;
    supported_color_modes?: string[];
    [key: string]: unknown;
  };
};

type HomeAssistantError = {
  message?: string;
};

type HomeAssistantWebSocketMessage =
  | { type: 'auth_required' }
  | { type: 'auth_ok' }
  | { type: 'auth_invalid'; message?: string }
  | { id: number; type: 'result'; success: boolean; result?: unknown; error?: HomeAssistantError }
  | {
      id: number;
      type: 'event';
      event: {
        event_type: 'state_changed';
        data: {
          entity_id: string;
          new_state: HomeAssistantEntity | null;
          old_state?: HomeAssistantEntity | null;
        };
      };
    };

type StateChangeHandler = (entityId: string, nextState: HomeAssistantEntity | null) => void;

type StateChangeSubscriptionOptions = {
  onOpen?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onStateChange: StateChangeHandler;
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

type StateChangeSubscription = {
  id: number;
  options: StateChangeSubscriptionOptions;
};

const getHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

const getUrl = (path: string) => {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_LOCAL_HOST_HA is not configured.');
  }

  return `${BASE_URL}${path}`;
};

const getWebSocketUrl = () => {
  return getSameOriginWebSocketUrl('/api/ha/ws');
};

class HomeAssistantWebSocketClient {
  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private nextMessageId = 1;
  private pendingRequests = new Map<number, PendingRequest>();
  private subscriptions = new Map<number, StateChangeSubscription>();
  private closedByClient = false;

  private getNextId() {
    const id = this.nextMessageId;
    this.nextMessageId += 1;
    return id;
  }

  private cleanupSocket() {
    this.socket = null;
    this.connectPromise = null;
  }

  private rejectPendingRequests(error: Error) {
    this.pendingRequests.forEach(({ reject }) => reject(error));
    this.pendingRequests.clear();
  }

  private notifySubscriptionsError(error: Error) {
    this.subscriptions.forEach(({ options }) => {
      options.onError?.(error);
    });
  }

  private notifySubscriptionsClosed() {
    this.subscriptions.forEach(({ options }) => {
      options.onClose?.();
    });
  }

  private async sendMessage(message: Record<string, unknown>) {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Home Assistant WebSocket is not connected.');
    }

    this.socket.send(JSON.stringify(message));
  }

  private async connect() {
    if (typeof window === 'undefined') {
      throw new Error('Home Assistant WebSocket is only available in the browser.');
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.closedByClient = false;
    this.connectPromise = new Promise((resolve, reject) => {
      const socket = new window.WebSocket(getWebSocketUrl());
      let settled = false;

      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data) as HomeAssistantWebSocketMessage;

        if (message.type === 'auth_required') {
          socket.send(JSON.stringify({ type: 'auth', access_token: TOKEN }));
          return;
        }

        if (message.type === 'auth_ok') {
          this.socket = socket;
          settled = true;
          resolve();
          this.subscriptions.forEach(({ id }) => {
            void this.sendSubscribeRequest(id);
          });
          return;
        }

        if (message.type === 'auth_invalid') {
          const error = new Error(
            message.message ?? 'Home Assistant WebSocket authentication failed.'
          );

          if (!settled) {
            settled = true;
            reject(error);
          }

          this.rejectPendingRequests(error);
          this.notifySubscriptionsError(error);
          socket.close();
          return;
        }

        if (message.type === 'result') {
          const pending = this.pendingRequests.get(message.id);

          if (!pending) {
            return;
          }

          this.pendingRequests.delete(message.id);

          if (message.success) {
            pending.resolve(message.result);
            const subscription = this.subscriptions.get(message.id);
            subscription?.options.onOpen?.();
            return;
          }

          pending.reject(
            new Error(message.error?.message ?? 'Home Assistant WebSocket request failed.')
          );
          return;
        }

        if (message.type === 'event') {
          const subscription = this.subscriptions.get(message.id);
          if (!subscription) {
            return;
          }

          subscription.options.onStateChange(
            message.event.data.entity_id,
            message.event.data.new_state
          );
        }
      });

      socket.addEventListener('error', () => {
        const error = new Error('Home Assistant WebSocket connection failed.');

        if (!settled) {
          settled = true;
          reject(error);
        }

        this.rejectPendingRequests(error);
        this.notifySubscriptionsError(error);
      });

      socket.addEventListener('close', () => {
        this.cleanupSocket();

        if (!this.closedByClient) {
          const error = new Error('Home Assistant WebSocket connection closed.');
          this.rejectPendingRequests(error);
          this.notifySubscriptionsClosed();
        }
      });
    });

    return this.connectPromise;
  }

  private async sendSubscribeRequest(id: number) {
    const pending = new Promise<void>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: () => resolve(),
        reject,
      });
    });

    try {
      await this.sendMessage({
        id,
        type: 'subscribe_events',
        event_type: 'state_changed',
      });
      await pending;
    } catch (error) {
      this.pendingRequests.delete(id);
      throw error;
    }
  }

  async callService(
    domain: string,
    service: string,
    serviceData: Record<string, unknown>
  ) {
    const id = this.getNextId();
    const pending = new Promise<unknown>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });

    try {
      await this.sendMessage({
        id,
        type: 'call_service',
        domain,
        service,
        service_data: serviceData,
      });
      return await pending;
    } catch (error) {
      this.pendingRequests.delete(id);
      throw error;
    }
  }

  async getStates() {
    const id = this.getNextId();
    const pending = new Promise<HomeAssistantEntity[]>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: (value) => resolve(value as HomeAssistantEntity[]),
        reject,
      });
    });

    try {
      await this.sendMessage({
        id,
        type: 'get_states',
      });
      return await pending;
    } catch (error) {
      this.pendingRequests.delete(id);
      throw error;
    }
  }

  subscribeToStateChanges(options: StateChangeSubscriptionOptions) {
    const id = this.getNextId();
    this.subscriptions.set(id, { id, options });

    void this.sendSubscribeRequest(id).catch((error) => {
      options.onError?.(
        error instanceof Error
          ? error
          : new Error('Home Assistant WebSocket subscription failed.')
      );
    });

    return () => {
      this.subscriptions.delete(id);

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ id: this.getNextId(), type: 'unsubscribe_events', subscription: id }));
      }

      if (this.subscriptions.size === 0 && this.pendingRequests.size === 0 && this.socket) {
        this.closedByClient = true;
        this.socket.close();
        this.cleanupSocket();
      }
    };
  }
}

const haWebSocketClient = new HomeAssistantWebSocketClient();

export const getStates = async (): Promise<HomeAssistantEntity[]> =>
  haWebSocketClient.getStates();

export const getState = async (entityId: string): Promise<HomeAssistantEntity> => {
  const response = await axios.get(getUrl(`/api/states/${entityId}`), {
    headers: getHeaders(),
  });

  return response.data;
};

export const setState = async (entityId: string, state: string) => {
  const response = await axios.post(
    getUrl(`/api/states/${entityId}`),
    { state },
    { headers: getHeaders() }
  );

  return response.data;
};

export const getService = async () => {
  const response = await axios.get(getUrl('/api/services'), {
    headers: getHeaders(),
  });

  return response.data;
};

export const callService = async (
  domain: string,
  service: string,
  serviceData: Record<string, unknown>
) => haWebSocketClient.callService(domain, service, serviceData);

export const toggleEntity = async (entityId: string) => {
  const [domain] = entityId.split('.');

  return callService(domain, 'toggle', { entity_id: entityId });
};

export const subscribeToStateChanges = (options: StateChangeSubscriptionOptions) =>
  haWebSocketClient.subscribeToStateChanges(options);
