import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../index.css';

export const Root = () => {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">Hello world · 你好世界</h1>
    </main>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
