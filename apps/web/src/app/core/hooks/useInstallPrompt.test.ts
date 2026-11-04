import { act, renderHook } from '@testing-library/react';

import { useInstallPrompt } from './useInstallPrompt';

const mockMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
};

const dispatchInstallPrompt = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  const prompt = vi.fn().mockResolvedValue(undefined);
  Object.assign(event, { prompt });
  act(() => {
    window.dispatchEvent(event);
  });
  return { event, prompt };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useInstallPrompt', () => {
  it('detects running as an installed app', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isStandalone).toBe(true);
  });

  it('captures the browser install prompt and replays it on demand', async () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canPrompt).toBe(false);

    const { event, prompt } = dispatchInstallPrompt();

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.canPrompt).toBe(true);

    await act(() => result.current.promptInstall());

    expect(prompt).toHaveBeenCalledOnce();
    expect(result.current.canPrompt).toBe(false);
  });

  it('marks the app installed after appinstalled fires', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useInstallPrompt());
    dispatchInstallPrompt();

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isStandalone).toBe(true);
    expect(result.current.canPrompt).toBe(false);
  });

  it('removes its listeners on unmount', () => {
    mockMatchMedia(false);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useInstallPrompt());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function),
    );
    expect(removeSpy).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function),
    );
  });
});
