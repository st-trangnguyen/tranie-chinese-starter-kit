import type { RouteObject } from 'react-router-dom';

import type { PageRoute } from './router.interface';

export const renderChildren = (routes: PageRoute[]): RouteObject[] =>
  routes.map((route): RouteObject => {
    const Element = route.element;
    if (route.index) {
      return { index: true, element: <Element /> };
    }
    return {
      path: route.path,
      element: <Element />,
      children: route.children ? renderChildren(route.children) : undefined,
    };
  });
