import { processUserMessage } from './LLMService';

describe('processUserMessage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns the assistant message and timing metrics from the api response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          role: 'assistant',
          content: 'Hello from CatSAMA',
        },
        meta: {
          mode: 'chat',
          command: 'none',
          timings: {
            requestParseMs: 10,
            llmMs: 120,
            commandMs: 5,
            totalMs: 135,
          },
        },
      }),
    }) as typeof fetch;

    jest.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(450);

    const result = await processUserMessage([{ role: 'user', content: 'Hi' }]);

    expect(global.fetch).toHaveBeenCalledWith('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });
    expect(result).toEqual({
      message: {
        role: 'assistant',
        content: 'Hello from CatSAMA',
      },
      metrics: {
        clientTotalMs: 350,
        serverTimings: {
          requestParseMs: 10,
          llmMs: 120,
          commandMs: 5,
          totalMs: 135,
        },
      },
    });
  });

  it('throws the api error message when the request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Assistant request failed.',
      }),
    }) as typeof fetch;

    await expect(processUserMessage([{ role: 'user', content: 'Hi' }])).rejects.toThrow(
      'Assistant request failed.'
    );
  });
});
