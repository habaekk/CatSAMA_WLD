export const executeCode = (responseCode: string): void => {
  eval(responseCode)
};