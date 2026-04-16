import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { z } from 'zod';
import {
  type AssistantApiResponse,
  type AssistantCommand,
  type AssistantMessage,
  assistantCommands,
} from '../../lib/assistant/types';

const assistantSchema = z.object({
  mode: z.enum(['chat', 'iot']),
  command: z.enum(assistantCommands),
  reply: z.string().min(1).max(240),
});

const AIR_PURIFIER_ENTITY =
  process.env.AIR_PURIFIER_ENTITY ??
  process.env.NEXT_PUBLIC_ENTITY ??
  'fan.zhimi_airpurifier_mb4';

const HOME_ASSISTANT_URL =
  process.env.HOME_ASSISTANT_URL ??
  process.env.NEXT_PUBLIC_LOCAL_HOST_HA ??
  'http://127.0.0.1:8123';

const HOME_ASSISTANT_TOKEN =
  process.env.HOME_ASSISTANT_TOKEN ?? process.env.NEXT_PUBLIC_LONG_LIVE_THE_TOKEN;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:14b';

const normalizeOllamaBaseUrl = (rawUrl: string) => {
  const trimmedUrl = rawUrl.replace(/\/+$/, '');
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

const getModel = () => {
  const ollamaBaseUrl = normalizeOllamaBaseUrl(
    process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434'
  );

  return createOllama({
    baseURL: ollamaBaseUrl,
  })(OLLAMA_MODEL);
};

const roleLabel: Record<AssistantMessage['role'], string> = {
  system: 'System',
  user: 'User',
  assistant: 'Assistant',
};

const formatConversation = (messages: AssistantMessage[]) =>
  messages
    .slice(-6)
    .map((message) => `${roleLabel[message.role]}: ${message.content}`)
    .join('\n');

const buildPrompt = (messages: AssistantMessage[]) => {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';

  return `
You are CatSAMA, a smart-home chat router.

Your job is to classify the latest request and return one small object.

Supported IOT commands:
- none
- turnAirPurifierOn
- turnAirPurifierOff
- toggleAirPurifier
- getAirPurifierState

Rules:
- Use mode "iot" only when the user is clearly asking about the air purifier.
- If the user asks about unsupported smart-home devices or routines, use mode "chat" and command "none".
- reply must be short, natural, and helpful.
- reply must not contain hashtags, brackets, code, JSON, or command names.
 - Default to English replies.
 - Only reply in another language when the user explicitly asks for that language.

Conversation:
${formatConversation(messages)}

Latest user message:
${latestUserMessage}
`.trim();
};

const getHeaders = () => {
  if (!HOME_ASSISTANT_TOKEN) {
    throw new Error('Home Assistant token is not configured.');
  }

  return {
    Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
    'Content-Type': 'application/json',
  };
};

const fetchHomeAssistantState = async (entityId: string) => {
  const response = await fetch(
    `${HOME_ASSISTANT_URL.replace(/\/+$/, '')}/api/states/${entityId}`,
    {
      headers: getHeaders(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read Home Assistant state (${response.status}).`);
  }

  return (await response.json()) as {
    state: string;
    attributes?: {
      friendly_name?: string;
    };
  };
};

const callHomeAssistantService = async (
  domain: string,
  service: string,
  serviceData: Record<string, unknown>
) => {
  const response = await fetch(
    `${HOME_ASSISTANT_URL.replace(/\/+$/, '')}/api/services/${domain}/${service}`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(serviceData),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to call Home Assistant service ${domain}.${service} (${response.status}).`
    );
  }
};

const executeCommand = async (command: AssistantCommand, reply: string) => {
  switch (command) {
    case 'none':
      return reply;
    case 'turnAirPurifierOn':
      await callHomeAssistantService('fan', 'turn_on', { entity_id: AIR_PURIFIER_ENTITY });
      return reply;
    case 'turnAirPurifierOff':
      await callHomeAssistantService('fan', 'turn_off', { entity_id: AIR_PURIFIER_ENTITY });
      return reply;
    case 'toggleAirPurifier':
      await callHomeAssistantService('fan', 'toggle', { entity_id: AIR_PURIFIER_ENTITY });
      return reply;
    case 'getAirPurifierState': {
      const state = await fetchHomeAssistantState(AIR_PURIFIER_ENTITY);
      const friendlyName = state.attributes?.friendly_name ?? 'Air purifier';
      return `${friendlyName} is currently ${state.state}.`;
    }
  }
};

export async function POST(request: Request) {
  const requestStartedAt = performance.now();

  try {
    const parseStartedAt = performance.now();
    const body = (await request.json()) as {
      messages?: AssistantMessage[];
    };
    const parseCompletedAt = performance.now();

    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: 'messages is required.' }, { status: 400 });
    }

    const llmStartedAt = performance.now();
    const { object } = await generateObject({
      model: getModel(),
      schema: assistantSchema,
      prompt: buildPrompt(messages),
      temperature: 0,
      providerOptions: {
        ollama: {
          options: {
            num_ctx: 4096,
          },
        },
      },
    });
    const llmCompletedAt = performance.now();

    const commandStartedAt = performance.now();
    const content = await executeCommand(object.command, object.reply);
    const commandCompletedAt = performance.now();

    const timings = {
      requestParseMs: Number((parseCompletedAt - parseStartedAt).toFixed(1)),
      llmMs: Number((llmCompletedAt - llmStartedAt).toFixed(1)),
      commandMs: Number((commandCompletedAt - commandStartedAt).toFixed(1)),
      totalMs: Number((commandCompletedAt - requestStartedAt).toFixed(1)),
    };

    const response: AssistantApiResponse = {
      message: {
        role: 'assistant',
        content,
      },
      meta: {
        mode: object.mode,
        command: object.command,
        timings,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Server-Timing': [
          `parse;dur=${timings.requestParseMs}`,
          `llm;dur=${timings.llmMs}`,
          `command;dur=${timings.commandMs}`,
          `total;dur=${timings.totalMs}`,
        ].join(', '),
      },
    });
  } catch (error) {
    console.error('Assistant route failed:', error);

    return NextResponse.json(
      {
        error: 'Assistant request failed.',
      },
      { status: 500 }
    );
  }
}
