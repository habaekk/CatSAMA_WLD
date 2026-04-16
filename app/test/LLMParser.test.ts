import { parseResponse } from '../components/Chat/parseResponse';

describe('parseResponse', () => {
  it('parses IOT responses with command codes', () => {
    expect(parseResponse('#IOT# Turn on the lamp [light.turn_on]')).toEqual({
      type: 'iot',
      code: 'light.turn_on',
      content: 'Turn on the lamp',
    });
  });

  it('keeps IOT responses without a command code', () => {
    expect(parseResponse('#IOT# Check the kitchen sensors')).toEqual({
      type: 'iot',
      code: null,
      content: 'Check the kitchen sensors',
    });
  });

  it('parses casual responses by removing the casual tag', () => {
    expect(parseResponse('#CASUAL# Hello there')).toEqual({
      type: 'casual',
      code: null,
      content: 'Hello there',
    });
  });
});
