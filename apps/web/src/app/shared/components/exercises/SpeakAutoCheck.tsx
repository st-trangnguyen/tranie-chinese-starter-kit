import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import {
  diffSpeech,
  isSpeechMatch,
  normalizeSpeechText,
  type DiffSegment,
} from '../../utils/speech-diff.utils';

// Gộp các chữ `same` liền nhau vào một span để chữ khớp đọc liền mạch.
function groupSegments(segments: DiffSegment[]): DiffSegment[] {
  return segments.reduce<DiffSegment[]>((groups, segment) => {
    const last = groups[groups.length - 1];
    if (last && last.kind === 'same' && segment.kind === 'same') {
      return [
        ...groups.slice(0, -1),
        { kind: 'same', char: last.char + segment.char },
      ];
    }
    return [...groups, segment];
  }, []);
}

function getCharClassName(kind: DiffSegment['kind']): string {
  if (kind === 'different') {
    return 'auto-check-char is-different';
  }
  if (kind === 'missing') {
    return 'auto-check-char is-missing';
  }
  if (kind === 'extra') {
    return 'auto-check-char is-extra';
  }
  return 'auto-check-char';
}

interface SpeakAutoCheckProps {
  expected: string;
  transcript: string | null;
}

export function SpeakAutoCheck({ expected, transcript }: SpeakAutoCheckProps) {
  const { t } = useTranslation('lesson');
  const titleId = useId();
  const isNotHeard =
    transcript !== null && normalizeSpeechText(transcript) === '';
  const segments =
    transcript === null || isNotHeard ? null : diffSpeech(expected, transcript);

  return (
    <section
      aria-labelledby={titleId}
      className="auto-check flex flex-col gap-sm"
    >
      <h3 id={titleId} className="auto-check-title">
        {t('speak.autoCheck.title')}
      </h3>
      <p className="auto-check-message">{t('speak.autoCheck.hint')}</p>
      <div aria-live="polite" className="flex flex-col gap-sm">
        {isNotHeard && (
          <p className="auto-check-message">{t('speak.autoCheck.notHeard')}</p>
        )}
        {segments && (
          <>
            <p className="auto-check-text flex flex-wrap">
              {groupSegments(segments).map((segment, index) => (
                <span key={index} className={getCharClassName(segment.kind)}>
                  {segment.char}
                  {segment.kind === 'different' && (
                    <span className="auto-check-label">
                      {t('speak.autoCheck.label.different')}
                    </span>
                  )}
                  {segment.kind === 'missing' && (
                    <span className="auto-check-label">
                      {t('speak.autoCheck.label.missing')}
                    </span>
                  )}
                  {segment.kind === 'extra' && (
                    <span className="auto-check-label">
                      {t('speak.autoCheck.label.extra')}
                    </span>
                  )}
                </span>
              ))}
            </p>
            {isSpeechMatch(segments) && (
              <p role="status" className="auto-check-message">
                {t('speak.autoCheck.matched')}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
