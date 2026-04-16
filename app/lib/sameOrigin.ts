'use client';

const getWindowOrigin = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  return window.location.origin;
};

export const getSameOriginHttpUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_ORIGIN ?? getWindowOrigin();
  return new URL(path, baseUrl).toString();
};

export const getSameOriginWebSocketUrl = (path: string) => {
  const baseUrl = getSameOriginHttpUrl(path);
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};
