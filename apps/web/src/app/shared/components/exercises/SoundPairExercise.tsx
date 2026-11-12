import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExerciseProps } from './exercise.types';
import { orderPair } from '../../utils/pair-order.utils';
import { ListenButton } from '../ListenButton';
import { SlowToggle } from '../SlowToggle';

export function SoundPairExercise({
  exercise,
  content,
  onResult,
  isLocked,
}: ExerciseProps<'sound-pair'>) {
  const { t } = useTranslation('lesson');
  const [orderedWords] = useState(() => {
    const [first, second] = content.words;
    return first && second
      ? orderPair([first, second], () => Math.random())
      : null;
  });
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const answerWord = content.words.find(
    (word) => word.id === exercise.answerWordId,
  );

  if (!orderedWords || !answerWord) {
    return null;
  }

  const answerPinyin = answerWord.pinyin;

  const isSelectionLocked = selectedWordId !== null || isLocked;

  function handleSelect(wordId: string): void {
    if (isSelectionLocked) {
      return;
    }
    setSelectedWordId(wordId);
    if (wordId === exercise.answerWordId) {
      onResult({ isCorrect: true });
      return;
    }
    onResult({
      isCorrect: false,
      explanation: t('soundPair.explanation', { pinyin: answerPinyin }),
    });
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <ListenButton audioPath={answerWord.audio} />
        <SlowToggle />
      </div>
      <div
        role="group"
        aria-label={t('soundPair.groupLabel')}
        className="flex flex-col gap-sm"
      >
        {orderedWords.map((word) => (
          <button
            key={word.id}
            type="button"
            className="sound-pair-option"
            disabled={isSelectionLocked}
            onClick={() => handleSelect(word.id)}
          >
            {word.pinyin}
          </button>
        ))}
      </div>
      {selectedWordId !== null && (
        <div className="sound-pair-compare flex flex-wrap gap-sm p-md">
          {orderedWords.map((word) => (
            <ListenButton
              key={word.id}
              audioPath={word.audio}
              label={t('soundPair.listenWord', { pinyin: word.pinyin })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
