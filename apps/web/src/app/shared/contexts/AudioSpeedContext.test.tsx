import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AudioSpeedProvider } from './AudioSpeedContext';
import { useAudioSpeed } from './useAudioSpeed';

function wrapper({ children }: { children: ReactNode }) {
  return <AudioSpeedProvider>{children}</AudioSpeedProvider>;
}

describe('AudioSpeedContext', () => {
  it('S4.4-AC2: mặc định phát tốc độ thường (isSlow = false)', () => {
    const { result } = renderHook(() => useAudioSpeed(), { wrapper });

    expect(result.current.isSlow).toBe(false);
  });

  it('S4.4-AC2: bật Nghe chậm thì isSlow = true (phát 0.75x)', () => {
    const { result } = renderHook(() => useAudioSpeed(), { wrapper });

    act(() => result.current.toggleSlow());

    expect(result.current.isSlow).toBe(true);
  });

  it('S4.4-AC2: tắt Nghe chậm thì về tốc độ thường', () => {
    const { result } = renderHook(() => useAudioSpeed(), { wrapper });

    act(() => result.current.toggleSlow());
    act(() => result.current.toggleSlow());

    expect(result.current.isSlow).toBe(false);
  });

  it('S4.4-AC2: dùng ngoài provider thì isSlow = false và toggleSlow không lỗi', () => {
    const { result } = renderHook(() => useAudioSpeed());

    expect(result.current.isSlow).toBe(false);
    act(() => result.current.toggleSlow());
    expect(result.current.isSlow).toBe(false);
  });
});
