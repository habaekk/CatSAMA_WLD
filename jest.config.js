module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.jest.json'
      }
    }
  };