import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from './ChatWindow';
import { processUserMessage } from './LLMService';
import { generatePlanSuggestion } from './PlanSuggestionService';
import { speakWithVtuber } from './vtuberSpeechBridge';

jest.mock('./LLMService', () => ({
  processUserMessage: jest.fn(),
}));

jest.mock('./PlanSuggestionService', () => ({
  generatePlanSuggestion: jest.fn(),
}));

jest.mock('./vtuberSpeechBridge', () => ({
  speakWithVtuber: jest.fn(),
}));

const mockedProcessUserMessage = jest.mocked(processUserMessage);
const mockedGeneratePlanSuggestion = jest.mocked(generatePlanSuggestion);
const mockedSpeakWithVtuber = jest.mocked(speakWithVtuber);

describe('ChatWindow', () => {
  beforeEach(() => {
    mockedProcessUserMessage.mockReset();
    mockedGeneratePlanSuggestion.mockReset();
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

  it('renders a plan card after generating a personalized plan suggestion', async () => {
    const user = userEvent.setup();

    mockedGeneratePlanSuggestion.mockResolvedValue({
      entityCount: 14,
      generatedAt: '2026-04-16T12:00:00.000Z',
      plan: {
        title: '아침 환기와 집중 루틴',
        summary: '센서와 팬, 조명을 묶어서 짧은 아침 준비 루틴을 만듭니다.',
        rationale: '현재 연결된 실내 환경 엔티티를 활용하면 별도 앱 없이 바로 실행할 수 있습니다.',
        focusAreas: ['집중', '공기질'],
        steps: [
          {
            title: '거실 공기 확인',
            detail: '공기질 센서를 보고 팬을 먼저 켜서 환기를 시작합니다.',
            timeHint: '기상 직후',
            targetEntityIds: ['sensor.living_room_air_quality', 'fan.zhimi_airpurifier_mb4'],
          },
          {
            title: '작업등 켜기',
            detail: '책상 조명을 켜고 20분 집중 세션을 시작합니다.',
            timeHint: '환기 후 5분',
            targetEntityIds: ['light.desk_light'],
          },
          {
            title: '집중 종료 확인',
            detail: '움직임 센서가 없으면 직접 종료하고, 있으면 활동 상태를 확인합니다.',
            timeHint: '20분 후',
            targetEntityIds: ['binary_sensor.office_motion'],
          },
        ],
        fallback: '센서 값이 비정상이면 팬과 조명만 쓰는 10분 루틴으로 축소합니다.',
      },
    });

    render(<ChatWindow />);

    await user.click(screen.getByRole('button', { name: '사용자 맞춤 계획 제안' }));

    await waitFor(() => {
      expect(screen.getByText('아침 환기와 집중 루틴')).toBeInTheDocument();
    });

    expect(mockedGeneratePlanSuggestion).toHaveBeenCalledWith([]);
    expect(screen.getByText('14 entities scanned')).toBeInTheDocument();
    expect(screen.getByText('1. 거실 공기 확인')).toBeInTheDocument();
    expect(screen.getByText('sensor.living_room_air_quality · fan.zhimi_airpurifier_mb4')).toBeInTheDocument();
  });
});
