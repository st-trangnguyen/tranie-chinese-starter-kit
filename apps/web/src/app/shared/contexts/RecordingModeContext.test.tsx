import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { renderHook, act } from '@testing-library/react';

import { RecordingModeProvider } from './RecordingModeContext';
import { useRecordingMode } from './useRecordingMode';

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return <RecordingModeProvider>{children}</RecordingModeProvider>;
}

describe('RecordingModeContext', () => {
  it('S5.4-AC2: mặc định không ở chế độ đọc to; enterReadAloud bật, leaveReadAloud tắt', () => {
    const { result } = renderHook(() => useRecordingMode(), { wrapper });
    expect(result.current.isReadAloud).toBe(false);

    act(() => result.current.enterReadAloud());
    expect(result.current.isReadAloud).toBe(true);

    act(() => result.current.leaveReadAloud());
    expect(result.current.isReadAloud).toBe(false);
  });

  it('S5.4-AC2: thiếu provider thì là no-op, không throw và luôn isReadAloud false', () => {
    const { result } = renderHook(() => useRecordingMode());

    expect(() => {
      act(() => result.current.enterReadAloud());
      act(() => result.current.leaveReadAloud());
    }).not.toThrow();
    expect(result.current.isReadAloud).toBe(false);
  });
});
