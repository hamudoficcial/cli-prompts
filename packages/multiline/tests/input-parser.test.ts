import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputParser } from '../src/input-parser';

describe('InputParser', () => {
  let parser: InputParser;
  const keySpy = vi.fn();
  const pasteSpy = vi.fn();

  beforeEach(() => {
    parser = new InputParser();
    parser.on('key', keySpy);
    parser.on('paste', pasteSpy);
    keySpy.mockClear();
    pasteSpy.mockClear();
  });

  it('should emit key events for simple characters', () => {
    parser.parse(Buffer.from('abc'));
    expect(keySpy).toHaveBeenCalledTimes(3);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'a' }));
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'b' }));
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'c' }));
  });

  it('should correctly parse a known single-character sequence (Enter)', () => {
    parser.parse(Buffer.from('\r'));
    expect(keySpy).toHaveBeenCalledTimes(1);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'return' }));
  });

  it('should correctly parse a known multi-character sequence (Up Arrow)', () => {
    parser.parse(Buffer.from('\x1b[A'));
    expect(keySpy).toHaveBeenCalledTimes(1);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'up' }));
  });

  it('should handle sequences split across multiple chunks', () => {
    parser.parse(Buffer.from('\x1b[')); // Incomplete sequence
    expect(keySpy).not.toHaveBeenCalled();
    parser.parse(Buffer.from('A')); // Complete the sequence
    expect(keySpy).toHaveBeenCalledTimes(1);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'up' }));
  });

  it('should handle bracketed paste in a single chunk', () => {
    parser.parse(Buffer.from('\x1b[200~hello\nworld\x1b[201~'));
    expect(pasteSpy).toHaveBeenCalledTimes(1);
    expect(pasteSpy).toHaveBeenCalledWith('hello\nworld');
    expect(keySpy).not.toHaveBeenCalled();
  });

  it('should handle bracketed paste split across multiple chunks', () => {
    parser.parse(Buffer.from('\x1b[200~hello'));
    expect(pasteSpy).not.toHaveBeenCalled();
    parser.parse(Buffer.from('\nworld'));
    expect(pasteSpy).not.toHaveBeenCalled();
    parser.parse(Buffer.from('\x1b[201~'));
    expect(pasteSpy).toHaveBeenCalledTimes(1);
    expect(pasteSpy).toHaveBeenCalledWith('hello\nworld');
    expect(keySpy).not.toHaveBeenCalled();
  });

  it('should process keypresses that arrive before and after a paste event', () => {
    parser.parse(Buffer.from('a\x1b[200~paste\x1b[201~b'));
    expect(keySpy).toHaveBeenCalledTimes(2);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'a' }));
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'b' }));
    expect(pasteSpy).toHaveBeenCalledTimes(1);
    expect(pasteSpy).toHaveBeenCalledWith('paste');
  });

  it('should correctly parse Alt+f for word-right', () => {
    parser.parse(Buffer.from('\x1bf'));
    expect(keySpy).toHaveBeenCalledTimes(1);
    expect(keySpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'right', ctrl: true }));
  });
});
