// src/LLMResponseParser.test.ts

import { parseResponse, ParsedResponse } from '../components/Chat/LLMParser';

describe('parseResponse', () => {
  it('should parse an IOT response correctly', () => {
    const response = '#IOT# [import { callService } from \'./api\'; const entity = process.env.NEXT_PUBLIC_ENTITY; await callService(domain="fan" service="toggle" serviceData={{ entity_id: entity });] Okay, I\'ve turned on the air purifier for you!';
    const expected: ParsedResponse = {
      type: 'iot',
      code: 'import { callService } from \'./api\'; const entity = process.env.NEXT_PUBLIC_ENTITY; await callService(domain="fan" service="toggle" serviceData={{ entity_id: entity });',
      content: 'Okay, I\'ve turned on the air purifier for you!'
    };
    expect(parseResponse(response)).toEqual(expected);
  });

  it('should handle a malformed IOT response without code correctly', () => {
    const response = '#IOT# Okay, I\'ve turned on the air purifier for you!';
    const expected: ParsedResponse = {
      type: 'iot',
      code: null,
      content: 'Okay, I\'ve turned on the air purifier for you!'
    };
    expect(parseResponse(response)).toEqual(expected);
  });

  it('should parse a casual response correctly', () => {
    const response = 'Hello, how can I assist you today?';
    const expected: ParsedResponse = {
      type: 'casual',
      code: null,
      content: 'Hello, how can I assist you today?'
    };
    expect(parseResponse(response)).toEqual(expected);
  });
});
