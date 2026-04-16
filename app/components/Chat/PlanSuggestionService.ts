'use client';

import type {
  AssistantMessage,
  AssistantPlanApiResponse,
  AssistantPlanSuggestion,
} from '../../lib/assistant/types';

export interface PlanSuggestionResult {
  plan: AssistantPlanSuggestion;
  entityCount: number;
  generatedAt: string;
}

export const generatePlanSuggestion = async (
  messages: AssistantMessage[]
): Promise<PlanSuggestionResult> => {
  const response = await fetch('/api/assistant/plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    let errorMessage = 'Plan suggestion request failed.';

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (typeof errorBody.error === 'string' && errorBody.error.length > 0) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Ignore malformed JSON and fall back to the default message.
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as AssistantPlanApiResponse;

  return {
    plan: data.plan,
    entityCount: data.meta.entityCount,
    generatedAt: data.meta.generatedAt,
  };
};
