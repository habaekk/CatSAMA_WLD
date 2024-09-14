import { llmCondition } from '../llmFunction'; // llmCondition 함수가 있는 경로로 수정 필요
import fetchMock from 'jest-fetch-mock';

// Fetch 모의 함수 사용
fetchMock.enableMocks();

describe('llmCondition', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should return 1 when the LLM response indicates the statement is true', async () => {
    // LLM 응답을 모의로 설정 (1은 True를 나타냄)
    fetchMock.mockResponseOnce(JSON.stringify({
      message: { content: '1' }
    }));

    const result = await llmCondition('The sky is blue. Is this sentence true?');
    expect(result).toBe(1); // 결과가 1인지 확인
  });

  it('should return 0 when the LLM response indicates the statement is false', async () => {
    // LLM 응답을 모의로 설정 (0은 False를 나타냄)
    fetchMock.mockResponseOnce(JSON.stringify({
      message: { content: '0' }
    }));

    const result = await llmCondition('The sky is green. Is this sentence true?');
    expect(result).toBe(0); // 결과가 0인지 확인
  });

  it('should return null when the LLM response is malformed', async () => {
    // 잘못된 LLM 응답을 모의로 설정 (정상적이지 않은 응답)
    fetchMock.mockResponseOnce('Invalid response format');

    const result = await llmCondition('This sentence will trigger an invalid response');
    expect(result).toBeNull(); // 잘못된 응답에 대해 null 리턴하는지 확인
  });

  it('should handle network errors gracefully', async () => {
    // 네트워크 오류를 모의로 설정
    fetchMock.mockReject(new Error('Network Error'));

    const result = await llmCondition('This sentence will trigger a network error');
    expect(result).toBeNull(); // 네트워크 오류 시 null 리턴하는지 확인
  });
});
