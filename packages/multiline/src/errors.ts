/**
 * Custom error thrown when the user aborts the input.
 */
export class AbortError extends Error {
  constructor(message = 'The input was aborted.') {
    super(message);
    this.name = 'AbortError';
  }
}
