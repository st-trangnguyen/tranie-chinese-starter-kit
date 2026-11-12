import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toneOfPinyin, type Tone } from '@csk/shared';

import type { ExerciseProps } from './exercise.types';
import { ListenButton } from '../ListenButton';
import { SlowToggle } from '../SlowToggle';

const TONE_OPTIONS: readonly Tone[] = [1, 2, 3, 4, 5];

export function ToneChoiceExercise({
  content,
  onResult,
  isLocked,
}: ExerciseProps<'tone-choice'>) {
  const { t } = useTranslation('lesson');
  const word = content.words[0];
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);

  if (!word) {
    return null;
  }

  const correctTone = toneOfPinyin(word.pinyin);

  function handleSelect(tone: Tone): void {
    if (isLocked || selectedTone !== null) {
      return;
    }
    setSelectedTone(tone);
    if (tone === correctTone) {
      onResult({ isCorrect: true });
      return;
    }
    onResult({
      isCorrect: false,
      explanation: t('toneChoice.explanation', {
        tone: t(`toneChoice.tones.${correctTone}`),
        pinyin: word.pinyin,
      }),
    });
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <ListenButton audioPath={word.audio} />
        <SlowToggle />
      </div>
      <div
        role="group"
        aria-label={t('toneChoice.groupLabel')}
        className="flex flex-col gap-sm"
      >
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone}
            type="button"
            className="tone-choice-option"
            disabled={isLocked || selectedTone !== null}
            onClick={() => handleSelect(tone)}
          >
            {t(`toneChoice.options.${tone}`)}
          </button>
        ))}
      </div>
      {selectedTone !== null && (
        <div
          className={`tone-choice-answer flex flex-col gap-xs ${
            selectedTone === correctTone ? 'is-correct' : 'is-incorrect'
          }`}
        >
          <span>{t('toneChoice.answerLabel')}</span>
          <span className="tone-choice-answer-tone">
            {t(`toneChoice.options.${correctTone}`)}
          </span>
          <span className="tone-choice-answer-pinyin">{word.pinyin}</span>
        </div>
      )}
    </div>
  );
}
