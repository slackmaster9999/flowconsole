import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHoverPopover, useNavigationHistory } from '../../src/web/hooks/hooks';

describe('useHoverPopover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens by hover and closes by hover', () => {
    const { result } = renderHook(() => useHoverPopover({ openDelay: 50, closeDelay: 50 }));

    act(() => {
      result.current.openByHover();
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.opened).toBe(true);

    act(() => {
      result.current.closeByHover();
      vi.advanceTimersByTime(60);
    });
    expect(result.current.opened).toBe(false);
  });
});

describe('useNavigationHistory', () => {
  it('tracks visits, back and forward navigation', () => {
    const { result } = renderHook(() => useNavigationHistory('root'));

    act(() => {
      result.current.visit('child');
    });
    expect(result.current.current).toBe('child');

    act(() => {
      result.current.goBack();
    });
    expect(result.current.current).toBe('root');

    act(() => {
      result.current.goForward();
    });
    expect(result.current.current).toBe('child');
  });
});
