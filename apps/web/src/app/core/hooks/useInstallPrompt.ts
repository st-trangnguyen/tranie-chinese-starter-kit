import { useCallback, useEffect, useState } from 'react';

/** Sự kiện `beforeinstallprompt` (Chromium) chưa có trong lib DOM của TypeScript. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const isBeforeInstallPromptEvent = (
  event: Event,
): event is BeforeInstallPromptEvent =>
  'prompt' in event && typeof event.prompt === 'function';

const STANDALONE_QUERY = '(display-mode: standalone)';

const detectStandalone = (): boolean => {
  const isIosStandalone =
    'standalone' in navigator && navigator.standalone === true;
  return window.matchMedia(STANDALONE_QUERY).matches || isIosStandalone;
};

const detectIos = (): boolean => /iphone|ipad|ipod/i.test(navigator.userAgent);

export interface InstallPromptState {
  /** App đang chạy như PWA đã cài (S1.3 AC2). */
  isStandalone: boolean;
  /** Trình duyệt cho phép mở hộp thoại cài (Chromium). */
  canPrompt: boolean;
  /** iOS Safari không có hộp thoại cài: phải hướng dẫn "Thêm vào MH chính". */
  isIos: boolean;
  promptInstall: () => Promise<void>;
}

export const useInstallPrompt = (): InstallPromptState => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [isIos] = useState(detectIos);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    const media = window.matchMedia(STANDALONE_QUERY);
    const handleDisplayModeChange = () => setIsStandalone(detectStandalone());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    media.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleInstalled);
      media.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isStandalone,
    canPrompt: deferredPrompt !== null,
    isIos,
    promptInstall,
  };
};
