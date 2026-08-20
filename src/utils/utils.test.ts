import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  debounce,
  flatArrTree,
  getApiTypesValue,
  handleLongText,
  isPhone,
  throttle
} from './utils';

describe('utils', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates Chinese mobile numbers', () => {
    expect(isPhone('13800138000')).toBe(true);
    expect(isPhone('12800138000')).toBe(false);
    expect(isPhone('1380013800')).toBe(false);
  });

  it('debounces calls and keeps the latest arguments', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200) as (...args: unknown[]) => void;

    debounced('first');
    debounced('latest', 2);
    vi.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('latest', 2);
  });

  it('throttles repeated calls during the cooldown', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled();
    throttled();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledOnce();

    throttled();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('handles long text and API parameter variants', () => {
    expect(handleLongText('abcdef', 4, undefined)).toBe('abcd...');
    expect(handleLongText('abcdef', 4, '…')).toBe('abcd…');
    expect(handleLongText('abc', 4, undefined)).toBe('abc');
    expect(getApiTypesValue('/users')).toEqual({
      url: '/users',
      params: undefined
    });
    expect(getApiTypesValue({ url: '/users', params: { page: 2 } })).toEqual({
      url: '/users',
      params: { page: 2 }
    });
  });

  it('flattens a tree without mutating the source', () => {
    const source = [
      {
        id: 1,
        children: [{ id: 2 }, { id: 3, children: [{ id: 4 }] }]
      }
    ];

    expect(flatArrTree(source, 'children')).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 }
    ]);
    expect(source[0].children).toHaveLength(2);
  });
});
