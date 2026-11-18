import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
  };
}

function getSnapshot(): boolean {
  return document.visibilityState === 'visible';
}

function getServerSnapshot(): boolean {
  return true;
}

export function usePageVisibility(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
