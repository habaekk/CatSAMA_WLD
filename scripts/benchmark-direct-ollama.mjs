const ollamaBaseUrl = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
const homeAssistantUrl =
  process.env.HOME_ASSISTANT_URL ?? process.env.NEXT_PUBLIC_LOCAL_HOST_HA ?? 'http://127.0.0.1:8123';
const homeAssistantToken =
  process.env.HOME_ASSISTANT_TOKEN ?? process.env.NEXT_PUBLIC_LONG_LIVE_THE_TOKEN;
const entityId =
  process.env.AIR_PURIFIER_ENTITY ??
  process.env.NEXT_PUBLIC_ENTITY ??
  'fan.zhimi_airpurifier_mb4';
const model = process.env.OLLAMA_MODEL ?? 'qwen3:14b';
const runs = Number.parseInt(process.env.BENCH_RUNS ?? '5', 10);

const mainPrompt = `
You are a cat assistant called catSAMA.
Do not use emojis. Use grammatically correct words.
You are a part of home IOT system with Home Assistant.
Refer to the conversation log and respond to the user's last chat.
`;

const haPrompt = `
You must distinguish which user want to make a casual chat or control&query of home devices.
In case of casual chat:
- Add '#CASUAL#' in the front of your response.
- You can chat freely with user.
In case of Control of home device:
- Add '#IOT#' in the front of your response.
- You should also add JS code to make it function.
- Choose from this exact code list and do not invent others:
  [toggleAirPurifier]
  [getAirPurifier]
Examples:
#IOT# [toggleAirPurifier] Okay, I've turned on the air purifier for you!
#IOT# [getAirPurifier] The air purifier is currently on.
`;

const iotPrompt = `${mainPrompt}\n${haPrompt}`.trim();

const prompts = [
  'Hello CatSAMA. Give me a one sentence summary of what you can do.',
  'Turn the air purifier on.',
  'What is the current air purifier status?',
];

const average = (values) =>
  Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));

const percentile = (values, ratio) => {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return Number(sorted[index].toFixed(1));
};

const summarize = (label, values) => ({
  metric: label,
  avgMs: average(values),
  p50Ms: percentile(values, 0.5),
  p95Ms: percentile(values, 0.95),
  minMs: Number(Math.min(...values).toFixed(1)),
  maxMs: Number(Math.max(...values).toFixed(1)),
});

const parseResponse = (response) => {
  const iotIndex = response.indexOf('#IOT#');

  if (iotIndex !== -1) {
    const codeMatch = response.match(/\[([^\]]+)\]/);
    const content = response.replace(/#IOT#|\[[^\]]+\]/g, '').trim();

    if (codeMatch) {
      return { type: 'iot', code: codeMatch[1], content };
    }

    return { type: 'iot', code: null, content };
  }

  return {
    type: 'casual',
    code: null,
    content: response.replace('#CASUAL#', '').trim(),
  };
};

const getHeaders = () => ({
  Authorization: `Bearer ${homeAssistantToken}`,
  'Content-Type': 'application/json',
});

const fetchHomeAssistantState = async () => {
  const response = await fetch(
    `${homeAssistantUrl.replace(/\/+$/, '')}/api/states/${entityId}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read Home Assistant state (${response.status}).`);
  }

  return response.json();
};

const toggleAirPurifier = async () => {
  const response = await fetch(
    `${homeAssistantUrl.replace(/\/+$/, '')}/api/services/fan/toggle`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ entity_id: entityId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to toggle air purifier (${response.status}).`);
  }
};

const executeCommand = async (command) => {
  switch (command) {
    case 'toggleAirPurifier':
      await toggleAirPurifier();
      return;
    case 'getAirPurifier':
      await fetchHomeAssistantState();
      return;
    default:
      return;
  }
};

const callDirectOllama = async (prompt) => {
  const response = await fetch(`${ollamaBaseUrl.replace(/\/+$/, '')}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: `${iotPrompt}\n\nUser: ${prompt}\nAssistant:`,
      stream: false,
      options: {
        temperature: 0,
        num_ctx: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  return response.json();
};

const runOnce = async (prompt) => {
  const clientStartedAt = performance.now();
  const llmStartedAt = performance.now();
  const ollamaPayload = await callDirectOllama(prompt);
  const llmCompletedAt = performance.now();
  const parsed = parseResponse(ollamaPayload.response ?? '');
  const commandStartedAt = performance.now();
  await executeCommand(parsed.code);
  const commandCompletedAt = performance.now();

  return {
    clientTotalMs: Number((commandCompletedAt - clientStartedAt).toFixed(1)),
    llmMs: Number((llmCompletedAt - llmStartedAt).toFixed(1)),
    commandMs: Number((commandCompletedAt - commandStartedAt).toFixed(1)),
  };
};

const main = async () => {
  console.log(`Benchmark target: ${ollamaBaseUrl}/api/generate`);
  console.log(`Model: ${model}`);
  console.log(`Runs per prompt: ${runs}`);

  const allResults = [];

  for (const prompt of prompts) {
    console.log(`\nPrompt: ${prompt}`);
    for (let index = 0; index < runs; index += 1) {
      const result = await runOnce(prompt);
      allResults.push(result);
      console.log(
        `  #${index + 1} client=${result.clientTotalMs}ms llm=${result.llmMs}ms post=${result.commandMs}ms`
      );
    }
  }

  const clientTotals = allResults.map((result) => result.clientTotalMs);
  const llmTotals = allResults.map((result) => result.llmMs);
  const commandTotals = allResults.map((result) => result.commandMs);

  console.log('\nSummary');
  console.table([
    summarize('clientTotal', clientTotals),
    summarize('llm', llmTotals),
    summarize('postProcess', commandTotals),
  ]);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
