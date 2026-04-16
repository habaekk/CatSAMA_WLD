import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { z } from 'zod';
import type { AssistantMessage, AssistantPlanApiResponse } from '../../../lib/assistant/types';

const HOME_ASSISTANT_URL =
  process.env.HOME_ASSISTANT_URL ??
  process.env.NEXT_PUBLIC_LOCAL_HOST_HA ??
  'http://127.0.0.1:8123';

const HOME_ASSISTANT_TOKEN =
  process.env.HOME_ASSISTANT_TOKEN ?? process.env.NEXT_PUBLIC_LONG_LIVE_THE_TOKEN;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:14b';

const roleLabel: Record<AssistantMessage['role'], string> = {
  system: 'System',
  user: 'User',
  assistant: 'Assistant',
};

const actionableDomains = new Set([
  'light',
  'switch',
  'fan',
  'climate',
  'cover',
  'vacuum',
  'media_player',
  'lock',
  'scene',
  'script',
  'humidifier',
  'input_boolean',
  'sensor',
  'binary_sensor',
]);

const planSchema = z.object({
  title: z.string().min(1).max(80),
  summary: z.string().min(1).max(220),
  rationale: z.string().min(1).max(280),
  focusAreas: z.array(z.string().min(1).max(40)).min(2).max(4),
  steps: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        detail: z.string().min(1).max(180),
        timeHint: z.string().min(1).max(40),
        targetEntityIds: z.array(z.string().min(1).max(120)).min(1).max(3),
      })
    )
    .min(3)
    .max(5),
  fallback: z.string().min(1).max(180),
});

type HomeAssistantEntity = {
  entity_id: string;
  state: string;
  attributes?: {
    friendly_name?: string;
    device_class?: string;
    supported_features?: number;
    [key: string]: unknown;
  };
};

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

const getHeaders = () => {
  if (!HOME_ASSISTANT_TOKEN) {
    throw new Error('Home Assistant token is not configured.');
  }

  return {
    Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
    'Content-Type': 'application/json',
  };
};

const fetchHomeAssistantStates = async () => {
  const response = await fetch(`${HOME_ASSISTANT_URL.replace(/\/+$/, '')}/api/states`, {
    headers: getHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to read Home Assistant states (${response.status}).`);
  }

  return (await response.json()) as HomeAssistantEntity[];
};

const capabilityForEntity = (entity: HomeAssistantEntity) => {
  const [domain] = entity.entity_id.split('.');

  switch (domain) {
    case 'light':
      return 'lighting control';
    case 'switch':
      return 'switchable device';
    case 'fan':
      return 'air quality or circulation control';
    case 'climate':
      return 'temperature control';
    case 'cover':
      return 'window or blind control';
    case 'vacuum':
      return 'cleaning automation';
    case 'media_player':
      return 'media scene support';
    case 'lock':
      return 'entry safety';
    case 'scene':
      return 'prebuilt scene activation';
    case 'script':
      return 'automation script trigger';
    case 'humidifier':
      return 'humidity control';
    case 'sensor':
      return 'environment sensing';
    case 'binary_sensor':
      return 'occupancy or event sensing';
    default:
      return 'connected home context';
  }
};

const formatConversation = (messages: AssistantMessage[]) =>
  messages
    .slice(-6)
    .map((message) => `${roleLabel[message.role]}: ${message.content}`)
    .join('\n');

const summarizeEntities = (entities: HomeAssistantEntity[]) =>
  entities
    .filter((entity) => actionableDomains.has(entity.entity_id.split('.')[0]))
    .filter((entity) => entity.state !== 'unavailable' && entity.state !== 'unknown')
    .slice(0, 80)
    .map((entity) => {
      const friendlyName = entity.attributes?.friendly_name ?? entity.entity_id;
      const deviceClass = entity.attributes?.device_class
        ? `, class=${entity.attributes.device_class}`
        : '';

      return `${entity.entity_id} | ${friendlyName} | state=${entity.state} | capability=${capabilityForEntity(
        entity
      )}${deviceClass}`;
    })
    .join('\n');

const buildPrompt = (messages: AssistantMessage[], entitySummary: string, entityCount: number) => `
You are CatSAMA's planning assistant.

Your job is to create a practical personalized plan using only the Home Assistant entities provided below.

Rules:
- Use only entities that appear in the entity list.
- Do not invent devices, routines, apps, or sensors.
- Write the plan in Korean.
- Make the plan realistic, low-friction, and useful for daily life at home.
- Prefer concrete actions that match the current state of the home.
- Each step must reference at least one real entity_id from the list.
- If the available entities are limited, still produce a small but coherent plan.

Conversation context:
${formatConversation(messages) || 'No recent conversation context.'}

Available Home Assistant entities (${entityCount} total, truncated list below):
${entitySummary || 'No actionable entities were found.'}
`.trim();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: AssistantMessage[];
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const entities = await fetchHomeAssistantStates();
    const entitySummary = summarizeEntities(entities);

    if (!entitySummary) {
      return NextResponse.json(
        {
          error: 'No actionable Home Assistant entities are available for planning.',
        },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: getModel(),
      schema: planSchema,
      prompt: buildPrompt(messages, entitySummary, entities.length),
      temperature: 0.3,
      providerOptions: {
        ollama: {
          options: {
            num_ctx: 8192,
          },
        },
      },
    });

    const response: AssistantPlanApiResponse = {
      plan: object,
      meta: {
        entityCount: entities.length,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assistant plan route failed:', error);

    return NextResponse.json(
      {
        error: 'Plan suggestion request failed.',
      },
      { status: 500 }
    );
  }
}
