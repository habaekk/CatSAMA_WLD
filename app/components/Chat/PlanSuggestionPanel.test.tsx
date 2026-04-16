import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanSuggestionPanel from './PlanSuggestionPanel';
import { generatePlanSuggestion } from './PlanSuggestionService';

jest.mock('./PlanSuggestionService', () => ({
  generatePlanSuggestion: jest.fn(),
}));

const mockedGeneratePlanSuggestion = jest.mocked(generatePlanSuggestion);

describe('PlanSuggestionPanel', () => {
  beforeEach(() => {
    mockedGeneratePlanSuggestion.mockReset();
  });

  it('renders a plan card after generating a personalized plan suggestion', async () => {
    const user = userEvent.setup();

    mockedGeneratePlanSuggestion.mockResolvedValue({
      entityCount: 14,
      generatedAt: '2026-04-16T12:00:00.000Z',
      plan: {
        title: '아침 환기와 집중 루틴',
        summary: '센서와 팬, 조명을 묶어서 짧은 아침 준비 루틴을 만듭니다.',
        rationale: '현재 연결된 실내 환경 엔티티를 사용하면 별도 앱 없이 바로 실행할 수 있습니다.',
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
            detail: '움직임 센서가 있으면 활동 상태를 확인하고 루틴을 마무리합니다.',
            timeHint: '20분 후',
            targetEntityIds: ['binary_sensor.office_motion'],
          },
        ],
        fallback: '센서 값이 비정상이면 팬과 조명만 쓰는 10분 루틴으로 축소합니다.',
      },
    });

    render(<PlanSuggestionPanel messages={[]} />);

    await user.click(screen.getByRole('button', { name: '사용자 맞춤 계획 제안' }));

    await waitFor(() => {
      expect(screen.getByText('아침 환기와 집중 루틴')).toBeInTheDocument();
    });

    expect(mockedGeneratePlanSuggestion).toHaveBeenCalledWith([]);
    expect(screen.getByText('14 entities scanned')).toBeInTheDocument();
    expect(screen.getByText('1. 거실 공기 확인')).toBeInTheDocument();
    expect(
      screen.getByText('sensor.living_room_air_quality · fan.zhimi_airpurifier_mb4')
    ).toBeInTheDocument();
  });
});
