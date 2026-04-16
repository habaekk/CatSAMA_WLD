'use client';

import { getSameOriginWebSocketUrl } from '../../lib/sameOrigin';

const VTUBER_WS_URL =
  process.env.NEXT_PUBLIC_VTUBER_WS_URL ?? getSameOriginWebSocketUrl('/vtuber-ws');

let socket: WebSocket | null = null;
let isConnecting = false;
const pendingMessages: string[] = [];

const flushQueue = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  while (pendingMessages.length > 0) {
    const text = pendingMessages.shift();
    if (!text) {
      continue;
    }

    socket.send(
      JSON.stringify({
        type: 'external-speak-text',
        text,
      })
    );
  }
};

const ensureConnection = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket;
  }

  if (isConnecting) {
    return socket;
  }

  isConnecting = true;
  socket = new WebSocket(VTUBER_WS_URL);

  socket.addEventListener('open', () => {
    isConnecting = false;
    flushQueue();
  });

  socket.addEventListener('close', () => {
    isConnecting = false;
  });

  socket.addEventListener('error', () => {
    isConnecting = false;
  });

  socket.addEventListener('message', () => {
    // The VTuber iframe handles playback. This bridge only forwards text.
  });

  return socket;
};

export const speakWithVtuber = (text: string) => {
  const cleaned = text.trim();
  if (!cleaned) {
    return;
  }

  pendingMessages.push(cleaned);
  ensureConnection();
  flushQueue();
};
