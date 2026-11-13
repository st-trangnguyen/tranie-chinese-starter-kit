import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { RecorderFailureReason } from '@core/services/recorder.service';

interface RecordGuidanceProps {
  reason: RecorderFailureReason;
  onRetry: () => void;
}

const BLOCKED_STEP_KEYS = [
  'record.guidance.blocked.steps.1',
  'record.guidance.blocked.steps.2',
  'record.guidance.blocked.steps.3',
] as const;

export function RecordGuidance({ reason, onRetry }: RecordGuidanceProps) {
  const { t } = useTranslation('lesson');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  return (
    <section
      ref={sectionRef}
      role="alert"
      tabIndex={-1}
      className="record-guidance flex flex-col gap-sm"
    >
      {reason === 'blocked' && (
        <>
          <h3 className="record-guidance-title">
            {t('record.guidance.blocked.title')}
          </h3>
          <ol className="record-guidance-steps">
            {BLOCKED_STEP_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </>
      )}
      {reason === 'no-device' && (
        <>
          <h3 className="record-guidance-title">
            {t('record.guidance.noDevice.title')}
          </h3>
          <p className="record-guidance-body">
            {t('record.guidance.noDevice.body')}
          </p>
        </>
      )}
      {reason === 'unsupported' && (
        <>
          <h3 className="record-guidance-title">
            {t('record.guidance.unsupported.title')}
          </h3>
          <p className="record-guidance-body">
            {t('record.guidance.unsupported.body')}
          </p>
        </>
      )}
      {reason !== 'unsupported' && (
        <button type="button" className="record-play-button" onClick={onRetry}>
          {t('record.retry')}
        </button>
      )}
    </section>
  );
}
