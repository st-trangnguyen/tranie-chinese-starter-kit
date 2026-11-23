import { createContext, useContext } from 'react';

import {
  offlineAudioService,
  type OfflineAudioService,
} from '@shared/services/offline-audio.service';

/**
 * Service audio offline của app (S8.4, design D8). Mặc định là singleton nên không cần provider ở
 * `App.tsx`; test bọc instance riêng trên adapter giả để không rò state giữa test.
 */
export const OfflineAudioServiceContext =
  createContext<OfflineAudioService>(offlineAudioService);

export function useOfflineAudioService(): OfflineAudioService {
  return useContext(OfflineAudioServiceContext);
}
