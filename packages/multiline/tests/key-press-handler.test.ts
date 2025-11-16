import { describe, it, expect, beforeEach } from 'vitest';
import { handleKeyPress } from '../src/key-press-handler';
import { createState } from '../src/state';
import type { State } from '../src/state';
import { defaultStyle } from '../src/styles';

// Helper to create a mock key object
const key = (
  name: string,
  opts: Partial<{ ctrl: boolean; meta: boolean; shift: boolean; sequence: string }> = {}
) => ({
  name,
  sequence: opts.sequence || name,
  ctrl: opts.ctrl || false,
  meta: opts.meta || false,
  shift: opts.shift || false,
});

describe('handleKeyPress', () => {
  let state: State;

  beforeEach(() => {
    state = createState('prompt', false, defaultStyle);
  });

  it('should insert a character', () => {
    handleKeyPress(state, key('a'));
    expect(state.value).toEqual(['a']);
    expect(state.cursor).toEqual({ x: 1, y: 0 });
  });

  it('should create a new line on Shift+Enter', () => {
    state.value = ['foo'];
    state.cursor = { x: 1, y: 0 };
    handleKeyPress(state, key('enter', { shift: true }));
    expect(state.value).toEqual(['f', 'oo']);
    expect(state.cursor).toEqual({ x: 0, y: 1 });
  });

  it('should set isDone on plain Enter', () => {
    handleKeyPress(state, key('return'));
    expect(state.isDone).toBe(true);
  });

  it('should handle normal backspace', () => {
    state.value = ['a'];
    state.cursor = { x: 1, y: 0 };
    handleKeyPress(state, key('backspace'));
    expect(state.value).toEqual(['']);
    expect(state.cursor).toEqual({ x: 0, y: 0 });
  });

  it('should merge lines on backspace at the start of a line', () => {
    state.value = ['a', 'b'];
    state.cursor = { x: 0, y: 1 };
    handleKeyPress(state, key('backspace'));
    expect(state.value).toEqual(['ab']);
    expect(state.cursor).toEqual({ x: 1, y: 0 });
  });

  it('should delete a word on Alt+Backspace', () => {
    state.value = ['foo bar baz'];
    state.cursor = { x: 11, y: 0 };
    handleKeyPress(state, key('backspace', { meta: true }));
    expect(state.value).toEqual(['foo bar ']);
    expect(state.cursor).toEqual({ x: 8, y: 0 });
  });

  it('should delete a word on Ctrl+W', () => {
    state.value = ['foo bar baz'];
    state.cursor = { x: 11, y: 0 };
    handleKeyPress(state, key('w', { ctrl: true }));
    expect(state.value).toEqual(['foo bar ']);
    expect(state.cursor).toEqual({ x: 8, y: 0 });
  });

  it('should move cursor word-right on Ctrl+Right', () => {
    state.value = ['foo bar baz'];
    state.cursor = { x: 0, y: 0 };
    handleKeyPress(state, key('right', { ctrl: true }));
    expect(state.cursor.x).toBe(4); // Start of "bar"
    handleKeyPress(state, key('right', { ctrl: true }));
    expect(state.cursor.x).toBe(8); // Start of "baz"
  });

  it('should move cursor word-left on Ctrl+Left', () => {
    state.value = ['foo bar baz'];
    state.cursor = { x: 11, y: 0 };
    handleKeyPress(state, key('left', { ctrl: true }));
    expect(state.cursor.x).toBe(8); // Start of "baz"
    handleKeyPress(state, key('left', { ctrl: true }));
    expect(state.cursor.x).toBe(4); // Start of "bar"
    handleKeyPress(state, key('left', { ctrl: true }));
    expect(state.cursor.x).toBe(0); // Start of "foo"
  });

  it('should block input when maxLength is reached', () => {
    state.maxLength = 5;
    state.value = ['hello'];
    state.cursor = { x: 5, y: 0 };
    handleKeyPress(state, key('!'));
    expect(state.value).toEqual(['hello']);
    expect(state.error).toContain('cannot exceed 5 characters');
  });

  it('should clear maxLength error after deleting characters', () => {
    state.maxLength = 5;
    state.value = ['hello'];
    state.cursor = { x: 5, y: 0 };
    handleKeyPress(state, key('!')); // Trigger the error
    expect(state.error).not.toBeNull();
    handleKeyPress(state, key('backspace')); // Delete a character
    expect(state.value).toEqual(['hell']);
    expect(state.error).toBeNull();
  });
});
