# LLM Latency Comparison

Date: 2026-04-16

## Goal

Compare LLM response latency between:

- direct Ollama calls from the old client-side flow
- the current `/api/assistant` flow using Vercel AI SDK `generateObject`

The comparison was done in the same local environment with the same Ollama model and the same prompt set.

## Test Environment

- App: `cat_sama_wld`
- Runtime: local Next.js app on `http://127.0.0.1:3000`
- Ollama: `http://127.0.0.1:11434`
- Model: `qwen3:14b`
- Home Assistant: `http://127.0.0.1:8123`
- Runs per prompt: `5`
- Prompt count: `3`
- Total requests per flow: `15`

## Prompt Set

1. `Hello CatSAMA. Give me a one sentence summary of what you can do.`
2. `Turn the air purifier on.`
3. `What is the current air purifier status?`

## Measurement Definitions

- `clientTotal`: total end-to-end time seen by the caller
- `serverTotal`: total time spent inside `/api/assistant`
- `llm`: time spent waiting for the LLM response
- `postProcess`: time spent executing Home Assistant follow-up work after the LLM response

## Results

### 1. Direct Ollama

Target: `http://127.0.0.1:11434/api/generate`

| metric | avgMs | p50Ms | p95Ms | minMs | maxMs |
| --- | ---: | ---: | ---: | ---: | ---: |
| clientTotal | 2558.0 | 2541.9 | 2909.9 | 2162.0 | 2909.9 |
| llm | 2452.1 | 2503.4 | 2909.8 | 1894.8 | 2909.8 |
| postProcess | 105.8 | 1.9 | 429.4 | 0.0 | 429.4 |

### 2. Current `/api/assistant` with Vercel AI SDK

Target: `http://127.0.0.1:3000/api/assistant`

| metric | avgMs | p50Ms | p95Ms | minMs | maxMs |
| --- | ---: | ---: | ---: | ---: | ---: |
| clientTotal | 2604.1 | 2566.0 | 3132.9 | 2114.7 | 3132.9 |
| serverTotal | 2588.2 | 2553.7 | 3075.2 | 2101.2 | 3075.2 |
| llm | 2498.8 | 2505.7 | 3074.5 | 1909.1 | 3074.5 |
| postProcess | 89.0 | 2.1 | 408.3 | 0.0 | 408.3 |

## Delta Summary

Current `/api/assistant` minus direct Ollama:

- `clientTotal`: `+46.1ms`
- `llm`: `+46.7ms`
- `postProcess`: `-16.8ms`

## Interpretation

- In this local setup, the two flows are effectively in the same latency band.
- The dominant cost is model inference time, not SDK overhead.
- The measured difference between direct Ollama and the current Vercel AI SDK route was about `46ms` on average.
- That gap is too small to support the claim that the SDK migration materially slowed down responses.
- Home Assistant actions add noticeable tail latency only for device-control prompts.

## Conclusion

Based on this run:

- direct Ollama was slightly faster on average
- the difference was small and likely operationally negligible
- the main bottleneck is `qwen3:14b` generation time itself

If a noticeable UX improvement is needed, the next comparison should be:

- `non-streaming` vs `streaming`
- especially `TTFT` (time to first token) vs full completion time

## Reproduction

Run the current route benchmark:

```bash
npm run benchmark:assistant
```

Run the direct Ollama benchmark:

```bash
npm run benchmark:direct-ollama
```

Optional:

```bash
BENCH_RUNS=20 npm run benchmark:assistant
BENCH_RUNS=20 npm run benchmark:direct-ollama
```

On Windows PowerShell:

```powershell
$env:BENCH_RUNS='20'
npm run benchmark:assistant
npm run benchmark:direct-ollama
```

## Notes

- The old direct flow was reconstructed from remaining prompt/parser logic, not restored from a full old commit.
- `npx tsc --noEmit` passed for the current measurement changes.
- `next build` was still blocked by OneDrive `.next/trace` file locking (`EPERM`), which is unrelated to the benchmark logic.
