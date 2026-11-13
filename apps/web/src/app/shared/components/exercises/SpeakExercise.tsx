import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOnlineStatus } from '@core/hooks/useOnlineStatus';
import { useSpeechRecognition } from '@core/hooks/useSpeechRecognition';

import type { ExerciseContent, ExerciseProps } from './exercise.types';
import {
  isRatingCorrect,
  SPEAK_RATINGS,
  type SpeakRating,
} from '../../utils/speak-rating.utils';
import { useRecordingMode } from '../../contexts/useRecordingMode';
import { RecordCompare } from '../RecordCompare';
import { SpeakAutoCheck } from './SpeakAutoCheck';

const RATING_LABEL_KEYS = {
  'not-yet': 'speak.rating.notYet',
  close: 'speak.rating.close',
  correct: 'speak.rating.correct',
} as const satisfies Record<SpeakRating, string>;

interface SpeakTarget {
  hanzi: string;
  pinyin: string;
  vi: string;
  audio: string;
}

function resolveTarget(
  exercise: ExerciseProps<'speak'>['exercise'],
  content: ExerciseContent,
): SpeakTarget | null {
  const word = content.words.find((item) => item.id === exercise.wordId);
  if (word) {
    return { ...word, vi: word.vi.join(', ') };
  }
  const sentence = content.sentences.find(
    (item) => item.id === exercise.sentenceId,
  );
  return sentence ?? null;
}

export function SpeakExercise({
  exercise,
  content,
  isLocked,
  onResult,
}: ExerciseProps<'speak'>) {
  const { t } = useTranslation('lesson');
  const [selectedRating, setSelectedRating] = useState<SpeakRating | null>(
    null,
  );
  const isOnline = useOnlineStatus();
  const speech = useSpeechRecognition();
  const { isReadAloud } = useRecordingMode();
  const canAutoCheck = isOnline && speech.isSupported && !isReadAloud;
  const isRatingLocked = selectedRating !== null || isLocked;
  const target = resolveTarget(exercise, content);

  if (!target) {
    return null;
  }

  function handleRecordStart(): void {
    if (canAutoCheck) {
      speech.start();
    }
  }

  function handleRecordStop(): void {
    if (speech.isListening) {
      void speech.stop();
    }
  }

  function handleSelect(rating: SpeakRating): void {
    if (isRatingLocked) {
      return;
    }
    setSelectedRating(rating);
    if (isRatingCorrect(rating)) {
      onResult({ isCorrect: true });
      return;
    }
    onResult({
      isCorrect: false,
      explanation: t('speak.explanation', {
        hanzi: target?.hanzi,
        pinyin: target?.pinyin,
        vi: target?.vi,
      }),
    });
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <p>{target.hanzi}</p>
        <p>{target.pinyin}</p>
        <p>{target.vi}</p>
      </div>
      <RecordCompare
        audioPath={target.audio}
        onRecordStart={handleRecordStart}
        onRecordStop={handleRecordStop}
      />
      {canAutoCheck && !speech.hasError && (
        <SpeakAutoCheck
          expected={target.hanzi}
          transcript={speech.transcript}
        />
      )}
      <div
        role="group"
        aria-label={t('speak.groupLabel')}
        className="flex flex-col gap-sm"
      >
        {SPEAK_RATINGS.map((rating) => {
          const isSelected = selectedRating === rating;
          return (
            <div key={rating} className="flex flex-col gap-xs">
              <button
                type="button"
                className={
                  isSelected
                    ? 'speak-rating-option is-selected'
                    : 'speak-rating-option'
                }
                aria-pressed={isSelected}
                disabled={isRatingLocked}
                onClick={() => handleSelect(rating)}
              >
                {t(RATING_LABEL_KEYS[rating])}
              </button>
              {isSelected && (
                <span className="speak-rating-selected">
                  {t('speak.selected')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
