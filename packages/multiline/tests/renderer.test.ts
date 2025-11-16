import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '../src/renderer';
import { createState } from '../src/state';
import type { State } from '../src/state';
import { defaultStyle } from '../src/styles';

describe('renderer', () => {
  let state: State;

  beforeEach(() => {
    state = createState('Test Prompt', false, defaultStyle);
  });

  it('should render the prompt', () => {
    const output = render(state);
    expect(output).toContain('Test Prompt');
  });

  it('should render the default value', () => {
    state.value = ['hello', 'world'];
    const output = render(state);
    expect(output).toContain('hello');
    expect(output).toContain('world');
  });

  it('should display a placeholder when the value is empty', () => {
    state.placeholder = 'Type something...';
    const output = render(state);
    expect(output).toContain('Type something...');
  });

  it('should not display a placeholder when the value is not empty', () => {
    state.placeholder = 'Type something...';
    state.value = ['a'];
    const output = render(state);
    expect(output).not.toContain('Type something...');
    expect(output).toContain('a');
  });

  it('should display an instruction line', () => {
    state.instruction = 'This is an instruction.';
    const output = render(state);
    expect(output).toContain('This is an instruction.');
  });

  it('should display an error message', () => {
    state.error = 'This is an error.';
    const output = render(state);
    expect(output).toContain('This is an error.');
    // Check for the error prefix
    expect(output).toContain(defaultStyle.prefixes.error);
  });

  it('should display a spinner frame instead of the prompt prefix', () => {
    state.spinner = {
      frames: ['|', '/', '-', '\\'],
      currentFrame: 2,
    };
    const output = render(state);
    expect(output).toContain('-'); // The current frame
    expect(output).not.toContain('?'); // The default prefix
  });
});
