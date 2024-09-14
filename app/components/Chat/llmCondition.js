// llmFunction.js

async function llmCondition(inputString) {
    // Construct the prompt to instruct the LLM to respond only with '1' or '0'
    const prompt = `
  You are an assistant that only replies with '1' or '0'.
  If the user's statement is true, reply with '1'. If it is false, reply with '0'.
  Do not provide any additional text or explanation.
  
  User: "${inputString}"
  Assistant:
  `;
  
    // Prepare the request body for the LLM API
    const body = {
      model: 'llama3', // Replace with your actual model name
      messages: [{ role: 'system', content: prompt }],
    };
  
    try {
      // Send the prompt to the local LLM API
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Read the response stream from the LLM
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response body');
      }
  
      let content = '';
      const decoder = new TextDecoder();
  
      // Continuously read chunks from the response stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const rawJson = decoder.decode(value);
        const json = JSON.parse(rawJson);
  
        // Accumulate the content from the LLM's response
        if (json.done === false) {
          content += json.message.content;
        }
      }
  
      // Convert the LLM's response to an integer (1 or 0)
      const result = parseInt(content.trim(), 10);
  
      // Return the integer value
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  // Example usage:
  (async () => {
    const result = await llmCondition('The sky is blue. Is this sentence true?');
    console.log('Result:', result); // Should output 1 if true, 0 if false
  })();
  