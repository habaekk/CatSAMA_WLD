import { getSameOriginHttpUrl, getSameOriginWebSocketUrl } from './sameOrigin';

describe('sameOrigin helpers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_ORIGIN;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APP_ORIGIN;
      return;
    }

    process.env.NEXT_PUBLIC_APP_ORIGIN = originalEnv;
  });

  it('builds same-origin http urls from NEXT_PUBLIC_APP_ORIGIN', () => {
    process.env.NEXT_PUBLIC_APP_ORIGIN = 'https://catsama.dev';

    expect(getSameOriginHttpUrl('/api/assistant')).toBe('https://catsama.dev/api/assistant');
  });

  it('converts same-origin http urls into secure websocket urls', () => {
    process.env.NEXT_PUBLIC_APP_ORIGIN = 'https://catsama.dev';

    expect(getSameOriginWebSocketUrl('/vtuber-ws')).toBe('wss://catsama.dev/vtuber-ws');
  });

  it('converts local http urls into ws urls', () => {
    process.env.NEXT_PUBLIC_APP_ORIGIN = 'http://localhost:3000';

    expect(getSameOriginWebSocketUrl('/vtuber-ws')).toBe('ws://localhost:3000/vtuber-ws');
  });
});
