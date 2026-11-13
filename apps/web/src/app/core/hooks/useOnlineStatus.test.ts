import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setOnline } from '@test/speech.helpers';

import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  beforeEach(() => {
    setOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setOnline(true);
  });

  it('S5.3-AC1: cập nhật khi sự kiện offline/online được phát', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      setOnline(false);
    });
    expect(result.current).toBe(false);

    act(() => {
      setOnline(true);
    });
    expect(result.current).toBe(true);
  });

  it('S5.3-AC1: gỡ listener online/offline khi unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());

    const added = addSpy.mock.calls
      .filter(([type]) => type === 'online' || type === 'offline')
      .map(([type]) => type);
    expect(added.sort()).toEqual(['offline', 'online']);

    unmount();

    const removed = removeSpy.mock.calls
      .filter(([type]) => type === 'online' || type === 'offline')
      .map(([type]) => type);
    expect(removed.sort()).toEqual(['offline', 'online']);
  });
});
