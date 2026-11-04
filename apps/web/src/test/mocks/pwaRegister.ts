import type { useRegisterSW as UseRegisterSW } from 'virtual:pwa-register/react';

/**
 * `virtual:pwa-register/react` chỉ tồn tại khi vite-plugin-pwa chạy (dev/build).
 * Vitest trỏ module ảo đó về file này; test nào cần thì `vi.mock` để đổi giá trị.
 */
export const useRegisterSW: typeof UseRegisterSW = () => ({
  needRefresh: [false, () => undefined],
  offlineReady: [false, () => undefined],
  updateServiceWorker: async () => undefined,
});
