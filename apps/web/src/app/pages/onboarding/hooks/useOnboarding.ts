import { useCallback, useEffect, useMemo, useState } from 'react';

import { ProgressService } from '@shared/services/progress.service';

export interface OnboardingState {
  /** null khi đang đọc IndexedDB. */
  needsOnboarding: boolean | null;
  isSaving: boolean;
  hasError: boolean;
  completeOnboarding: (minutes: number) => Promise<boolean>;
}

export const useOnboarding = (): OnboardingState => {
  const service = useMemo(() => new ProgressService(), []);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;
    service
      .needsOnboarding()
      .then((value) => {
        if (isActive) {
          setNeedsOnboarding(value);
        }
      })
      .catch(() => {
        // Không đọc được IndexedDB (ví dụ chế độ riêng tư): vẫn cho onboarding.
        if (isActive) {
          setNeedsOnboarding(true);
        }
      });
    return () => {
      isActive = false;
    };
  }, [service]);

  const completeOnboarding = useCallback(
    async (minutes: number) => {
      setIsSaving(true);
      setHasError(false);
      try {
        await service.completeOnboarding(minutes);
        return true;
      } catch {
        setHasError(true);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [service],
  );

  return { needsOnboarding, isSaving, hasError, completeOnboarding };
};
