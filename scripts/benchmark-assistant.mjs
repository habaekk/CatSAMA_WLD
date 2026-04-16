const baseUrl = process.env.ASSISTANT_BASE_URL ?? 'http://127.0.0.1:3000';
const runs = Number.parseInt(process.env.BENCH_RUNS ?? '7', 10);

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

const runOnce = async (prompt) => {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const completedAt = performance.now();
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }

  return {
    clientTotalMs: Number((completedAt - startedAt).toFixed(1)),
    serverTimings: payload.meta.timings,
  };
};

const main = async () => {
  console.log(`Benchmark target: ${baseUrl}/api/assistant`);
  console.log(`Runs per prompt: ${runs}`);

  const allResults = [];

  for (const prompt of prompts) {
    console.log(`\nPrompt: ${prompt}`);
    for (let index = 0; index < runs; index += 1) {
      const result = await runOnce(prompt);
      allResults.push(result);
      console.log(
        `  #${index + 1} client=${result.clientTotalMs}ms server=${result.serverTimings.totalMs}ms llm=${result.serverTimings.llmMs}ms post=${result.serverTimings.commandMs}ms`
      );
    }
  }

  const clientTotals = allResults.map((result) => result.clientTotalMs);
  const serverTotals = allResults.map((result) => result.serverTimings.totalMs);
  const llmTotals = allResults.map((result) => result.serverTimings.llmMs);
  const commandTotals = allResults.map((result) => result.serverTimings.commandMs);

  console.log('\nSummary');
  console.table([
    summarize('clientTotal', clientTotals),
    summarize('serverTotal', serverTotals),
    summarize('llm', llmTotals),
    summarize('postProcess', commandTotals),
  ]);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
