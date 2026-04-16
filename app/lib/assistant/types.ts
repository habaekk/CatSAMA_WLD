export type AssistantRole = 'assistant' | 'system' | 'user';

export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export const assistantCommands = [
  'none',
  'turnAirPurifierOn',
  'turnAirPurifierOff',
  'toggleAirPurifier',
  'getAirPurifierState',
] as const;

export type AssistantCommand = (typeof assistantCommands)[number];

export interface AssistantTimingMetrics {
  requestParseMs: number;
  llmMs: number;
  commandMs: number;
  totalMs: number;
}

export interface AssistantApiResponse {
  message: AssistantMessage;
  meta: {
    mode: 'chat' | 'iot';
    command: AssistantCommand;
    timings: AssistantTimingMetrics;
  };
}

export interface AssistantPlanStep {
  title: string;
  detail: string;
  timeHint: string;
  targetEntityIds: string[];
}

export interface AssistantPlanSuggestion {
  title: string;
  summary: string;
  rationale: string;
  focusAreas: string[];
  steps: AssistantPlanStep[];
  fallback: string;
}

export interface AssistantPlanApiResponse {
  plan: AssistantPlanSuggestion;
  meta: {
    entityCount: number;
    generatedAt: string;
  };
}
