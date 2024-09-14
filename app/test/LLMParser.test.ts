const llmCondition = require('../components/Chat/llmCondition');

// 테스트 전체 타임아웃을 30초로 설정 (30000ms)
jest.setTimeout(10000);

describe('llmCondition', () => {
  it('should return 1 when the statement is true', async () => {
    const result = await llmCondition('The sky is blue. Is this sentence true?');
    expect(result).toBe(1); // True일 때 1인지 확인
  });

  it('should return 0 when the statement is false', async () => {
    const result = await llmCondition('The sky is green. Is this sentence true?');
    expect(result).toBe(0); // False일 때 0인지 확인
  });

  // it('should return null when there is an unexpected response', async () => {
  //   const result = await llmCondition('This is an ambiguous question.');
  //   expect(result).toBeNull(); // 예상치 못한 응답 형식일 때 null 반환
  // });

  // it('should return null on network errors', async () => {
  //   // 서버가 동작하지 않거나, 네트워크 문제가 있을 경우 처리 확인
  //   const result = await llmCondition('This should fail due to network issues.');
  //   expect(result).toBeNull(); // 네트워크 문제일 때 null 리턴
  // });
});
