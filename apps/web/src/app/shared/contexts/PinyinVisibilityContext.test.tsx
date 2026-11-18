import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PinyinVisibilityProvider } from './PinyinVisibilityContext';
import { usePinyinVisibility } from './usePinyinVisibility';

function hiddenWrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <PinyinVisibilityProvider isVisible={false}>
      {children}
    </PinyinVisibilityProvider>
  );
}

function visibleWrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <PinyinVisibilityProvider isVisible>{children}</PinyinVisibilityProvider>
  );
}

describe('PinyinVisibilityContext', () => {
  describe('S8.2-AC3: Tắt pinyin thì câu nói không hiện pinyin', () => {
    it('S8.2-AC3: dùng ngoài provider thì mặc định hiện pinyin (true)', () => {
      const { result } = renderHook(() => usePinyinVisibility());

      expect(result.current).toBe(true);
    });

    it('S8.2-AC3: provider isVisible={false} thì không hiện pinyin (false)', () => {
      const { result } = renderHook(() => usePinyinVisibility(), {
        wrapper: hiddenWrapper,
      });

      expect(result.current).toBe(false);
    });

    it('S8.2-AC3: provider isVisible thì hiện pinyin (true)', () => {
      const { result } = renderHook(() => usePinyinVisibility(), {
        wrapper: visibleWrapper,
      });

      expect(result.current).toBe(true);
    });
  });
});
