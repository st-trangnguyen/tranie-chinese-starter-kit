import type { ReactNode } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AudioSpeedProvider } from './AudioSpeedContext';
import { useAudioSpeed } from './useAudioSpeed';

function wrapper({ children }: { children: ReactNode }) {
  return <AudioSpeedProvider>{children}</AudioSpeedProvider>;
}

function slowWrapper({ children }: { children: ReactNode }) {
  return <AudioSpeedProvider initialIsSlow>{children}</AudioSpeedProvider>;
}

function SpeedProbe(): ReactNode {
  const { isSlow, toggleSlow } = useAudioSpeed();
  return (
    <button type="button" onClick={toggleSlow}>
      {isSlow ? 'slow' : 'normal'}
    </button>
  );
}

function LessonHarness({ lessonId }: { lessonId: string }): ReactNode {
  return (
    <AudioSpeedProvider key={lessonId} initialIsSlow>
      <SpeedProbe />
    </AudioSpeedProvider>
  );
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

  describe('S8.2-AC2: Mở bài mới thì theo tốc độ mặc định Chậm', () => {
    it('S8.2-AC2: initialIsSlow thì mở bài là phát chậm (isSlow = true)', () => {
      const { result } = renderHook(() => useAudioSpeed(), {
        wrapper: slowWrapper,
      });

      expect(result.current.isSlow).toBe(true);
    });

    it('S8.2-AC2: tắt Nghe chậm trong bài thì về tốc độ thường', () => {
      const { result } = renderHook(() => useAudioSpeed(), {
        wrapper: slowWrapper,
      });

      act(() => result.current.toggleSlow());

      expect(result.current.isSlow).toBe(false);
    });

    it('S8.2-AC2: sang bài mới (provider mount lại) thì lại phát chậm', () => {
      const { rerender } = render(<LessonHarness lessonId="lesson-1" />);
      expect(screen.getByRole('button', { name: 'slow' })).toBeInTheDocument();

      act(() => screen.getByRole('button', { name: 'slow' }).click());
      expect(
        screen.getByRole('button', { name: 'normal' }),
      ).toBeInTheDocument();

      rerender(<LessonHarness lessonId="lesson-2" />);

      expect(screen.getByRole('button', { name: 'slow' })).toBeInTheDocument();
    });

    it('S8.2-AC2: không truyền initialIsSlow thì vẫn phát tốc độ thường', () => {
      const { result } = renderHook(() => useAudioSpeed(), { wrapper });

      expect(result.current.isSlow).toBe(false);
    });
  });
});
