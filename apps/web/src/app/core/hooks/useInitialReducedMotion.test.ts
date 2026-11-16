import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useInitialReducedMotion } from './useInitialReducedMotion';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type ChangeListener = (event: { matches: boolean; media: string }) => void;

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: (type: string, listener: ChangeListener) => void;
  removeEventListener: (type: string, listener: ChangeListener) => void;
  addListener: (listener: ChangeListener) => void;
  removeListener: (listener: ChangeListener) => void;
}

// Media giả cho phép đổi `matches` và phát `change` như trình duyệt thật.
const stubMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<ChangeListener>();
  const queries: string[] = [];
  const media: FakeMediaQueryList = {
    matches: initialMatches,
    media: REDUCED_MOTION_QUERY,
    addEventListener: (_type, listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      listeners.delete(listener);
    },
    addListener: (listener) => {
      listeners.add(listener);
    },
    removeListener: (listener) => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      queries.push(query);
      return media;
    }),
  );

  const change = (matches: boolean) => {
    media.matches = matches;
    listeners.forEach((listener) =>
      listener({ matches, media: REDUCED_MOTION_QUERY }),
    );
  };

  return { change, queries };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useInitialReducedMotion', () => {
  it('S6.1-AC1: trả true khi lúc mount người dùng bật giảm chuyển động', () => {
    const { queries } = stubMatchMedia(true);

    const { result } = renderHook(() => useInitialReducedMotion());

    expect(result.current).toBe(true);
    expect(queries).toContain(REDUCED_MOTION_QUERY);
  });

  it('S6.1-AC1: trả false khi lúc mount người dùng không bật giảm chuyển động', () => {
    stubMatchMedia(false);

    const { result } = renderHook(() => useInitialReducedMotion());

    expect(result.current).toBe(false);
  });

  it('S6.1-AC1: bật giảm chuyển động khi đang ở màn không đổi giá trị đã chốt', () => {
    const { change } = stubMatchMedia(false);
    const { result, rerender } = renderHook(() => useInitialReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      change(true);
    });
    rerender();

    expect(result.current).toBe(false);
  });

  it('S6.1-AC1: tắt giảm chuyển động khi đang ở màn không đổi giá trị đã chốt', () => {
    const { change } = stubMatchMedia(true);
    const { result, rerender } = renderHook(() => useInitialReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      change(false);
    });
    rerender();

    expect(result.current).toBe(true);
  });

  it('S6.1-AC1: mount lại (mở lại màn) thì đọc giá trị media mới', () => {
    const { change } = stubMatchMedia(false);
    const first = renderHook(() => useInitialReducedMotion());
    expect(first.result.current).toBe(false);

    act(() => {
      change(true);
    });
    first.unmount();

    const second = renderHook(() => useInitialReducedMotion());
    expect(second.result.current).toBe(true);
  });

  it('S6.1-AC1: trả false khi môi trường không có matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);

    const { result } = renderHook(() => useInitialReducedMotion());

    expect(result.current).toBe(false);
  });
});
