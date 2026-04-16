'use client';

import type {
  AssistantApiResponse,
  AssistantMessage,
  AssistantTimingMetrics,
} from '../../lib/assistant/types';

export interface AssistantClientMetrics {
  clientTotalMs: number;
  serverTimings: AssistantTimingMetrics;
}

export interface ProcessUserMessageResult {
  message: AssistantMessage;
  metrics: AssistantClientMetrics;
}

export const processUserMessage = async (
  messages: AssistantMessage[]
): Promise<ProcessUserMessageResult> => {
  const requestStartedAt = performance.now();
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    let errorMessage = 'Assistant request failed.';

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (typeof errorBody.error === 'string' && errorBody.error.length > 0) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Fall back to the default error message when the response body is not JSON.
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as AssistantApiResponse;
  const requestCompletedAt = performance.now();

  return {
    message: data.message,
    metrics: {
      clientTotalMs: Number((requestCompletedAt - requestStartedAt).toFixed(1)),
      serverTimings: data.meta.timings,
    },
  };
};
