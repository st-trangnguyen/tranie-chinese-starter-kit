import type { ComponentType, LazyExoticComponent } from 'react';

export interface PageRoute {
  /** Bỏ trống + `index: true` cho route mặc định của route cha. */
  path?: string;
  index?: boolean;
  element: LazyExoticComponent<ComponentType>;
  children?: PageRoute[];
}
