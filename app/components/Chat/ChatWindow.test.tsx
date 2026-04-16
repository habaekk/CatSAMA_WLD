import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from './ChatWindow';
import { processUserMessage } from './LLMService';
import { speakWithVtuber } from './vtuberSpeechBridge';

jest.mock('./LLMService', () => ({
  processUserMessage: jest.fn(),
}));

jest.mock('./vtuberSpeechBridge', () => ({
  speakWithVtuber: jest.fn(),
}));

const mockedProcessUserMessage = jest.mocked(processUserMessage);
const mockedSpeakWithVtuber = jest.mocked(speakWithVtuber);

describe('ChatWindow', () => {
  beforeEach(() => {
    mockedProcessUserMessage.mockReset();
    mockedSpeakWithVtuber.mockReset();
  });

  it('renders user and assistant messages and shows metrics after a successful send', async () => {
    const user = userEvent.setup();
    let resolveRequest:
      | ((value: {
          message: {
            role: 'assistant';
            content: string;
          };
          metrics: {
            clientTotalMs: number;
            serverTimings: {
              requestParseMs: number;
              llmMs: number;
              commandMs: number;
              totalMs: number;
            };
          };
        }) => void)
      | undefined;

    mockedProcessUserMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<ChatWindow />);

    await user.type(screen.getByPlaceholderText('Send a message to CatSAMA'), 'Turn on lights');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByText('Turn on lights')).toBeInTheDocument();
    expect(screen.getByText('Assistant is typing...')).toBeInTheDocument();

    resolveRequest?.({
      message: {
        role: 'assistant',
        content: 'The lights are on.',
      },
      metrics: {
        clientTotalMs: 2400,
        serverTimings: {
          requestParseMs: 30,
          llmMs: 1200,
          commandMs: 100,
          totalMs: 1330,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('The lights are on.')).toBeInTheDocument();
    });

    expect(screen.getByText('Client 2.40s | Server 1.33s | LLM 1.20s | Post 0.10s')).toBeInTheDocument();
    expect(mockedSpeakWithVtuber).toHaveBeenCalledWith('The lights are on.');
    expect(screen.queryByText('Assistant is typing...')).not.toBeInTheDocument();
  });

  it('shows an error message when the assistant request fails', async () => {
    const user = userEvent.setup();

    mockedProcessUserMessage.mockRejectedValue(new Error('Assistant request failed.'));

    render(<ChatWindow />);

    await user.type(screen.getByPlaceholderText('Send a message to CatSAMA'), 'Status?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Error: Assistant request failed.')).toBeInTheDocument();
    });

    expect(mockedSpeakWithVtuber).not.toHaveBeenCalled();
  });
});
