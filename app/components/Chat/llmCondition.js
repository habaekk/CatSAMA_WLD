async function llmCondition(inputString) {
    // LLM에게 요청할 프롬프트 구성
    const prompt = `
    You are an assistant that only replies with '1' or '0'.
    If the user's question is true, reply with '1'. If it is false, reply with '0'.
    Do not provide any additional text or explanation.
    
    User: "${inputString}"
    Assistant:
    `;
  
    // 요청 본문 구성
    const body = {
      model: 'llama3', // 실제 사용하는 모델 이름으로 수정 필요
      messages: [{ role: 'system', content: prompt }],
    };
  
    try {
      // 로컬 LLM API에 요청 보내기
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // 응답 처리
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response body');
      }
  
      let content = '';
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // 스트림 데이터를 읽어서 내용 축적
        const rawJson = decoder.decode(value);
        const json = JSON.parse(rawJson);
  
        if (json.done === false) {
          content += json.message.content;
        }
      }
  
      // 받은 응답을 정수로 변환
      const result = parseInt(content.trim(), 10);
  
      // 1 또는 0이 아닌 응답에 대한 처리
      if (isNaN(result)) {
        throw new Error('Unexpected response format');
      }
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  module.exports = llmCondition;