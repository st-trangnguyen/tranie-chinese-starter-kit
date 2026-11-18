import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setPageVisibility } from '@test/visibility.helpers';

import { usePageVisibility } from './usePageVisibility';

describe('usePageVisibility', () => {
  beforeEach(() => {
    setPageVisibility(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setPageVisibility(false);
  });

  it('S8.1-AC2: cập nhật khi trang bị ẩn rồi hiện lại', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);

    act(() => {
      setPageVisibility(true);
    });
    expect(result.current).toBe(false);

    act(() => {
      setPageVisibility(false);
    });
    expect(result.current).toBe(true);
  });

  it('S8.1-AC2: gỡ listener visibilitychange khi unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => usePageVisibility());

    const added = addSpy.mock.calls.filter(([type]) => type === 'visibilitychange');
    expect(added).toHaveLength(1);

    unmount();

    const removed = removeSpy.mock.calls.filter(([type]) => type === 'visibilitychange');
    expect(removed).toHaveLength(1);
    expect(removed[0]?.[1]).toBe(added[0]?.[1]);
  });
});
