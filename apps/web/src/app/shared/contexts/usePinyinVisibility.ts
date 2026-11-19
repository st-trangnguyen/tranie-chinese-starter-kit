import { createContext, useContext } from 'react';

export const PinyinVisibilityContext = createContext<boolean>(true);

export function usePinyinVisibility(): boolean {
  return useContext(PinyinVisibilityContext);
}
