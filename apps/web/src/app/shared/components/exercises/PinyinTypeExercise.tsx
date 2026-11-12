import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  comparePinyin,
  convertTypedPinyin,
  type PinyinComparison,
  type PinyinSyllableDiff,
} from '@csk/shared';

import type { ExerciseProps } from './exercise.types';
import { ListenButton } from '../ListenButton';
import { SlowToggle } from '../SlowToggle';

export function PinyinTypeExercise({
  content,
  onResult,
  isLocked,
}: ExerciseProps<'pinyin-type'>) {
  const { t } = useTranslation('lesson');
  const word = content.words[0];
  const [value, setValue] = useState('');
  const [result, setResult] = useState<PinyinComparison | null>(null);
  const isDisabled = result !== null || isLocked;

  if (!word) {
    return null;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setValue(convertTypedPinyin(event.target.value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!word || isDisabled || value.trim() === '') {
      return;
    }
    const comparison = comparePinyin(value, word.pinyin);
    setResult(comparison);
    onResult(
      comparison.isCorrect
        ? { isCorrect: true }
        : {
            isCorrect: false,
            explanation: t('pinyinType.explanation', { pinyin: word.pinyin }),
          },
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <ListenButton audioPath={word.audio} />
        <SlowToggle />
      </div>
      <form className="flex flex-col gap-sm" onSubmit={handleSubmit}>
        <label className="pinyin-type-label flex flex-col gap-xs">
          <span>{t('pinyinType.inputLabel')}</span>
          <input
            type="text"
            className="pinyin-type-input"
            value={value}
            disabled={isDisabled}
            onChange={handleChange}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            lang="zh-Latn-pinyin"
          />
        </label>
        <button
          type="submit"
          className="pinyin-type-submit"
          disabled={isDisabled}
        >
          {t('pinyinType.submit')}
        </button>
      </form>
      {result && (
        <div
          className="pinyin-type-answer flex flex-col gap-xs"
          role="status"
          aria-live="polite"
        >
          <p className="flex flex-col gap-xs">
            <span>{t('pinyinType.answerLabel')}</span>
            <span lang="zh-Latn-pinyin">{word.pinyin}</span>
          </p>
          {!result.isCorrect && <WrongParts syllables={result.syllables} />}
        </div>
      )}
    </div>
  );
}

interface WrongPartsProps {
  syllables: PinyinSyllableDiff[];
}

function WrongParts({ syllables }: WrongPartsProps) {
  const { t } = useTranslation('lesson');
  const missing = t('pinyinType.missing');

  return (
    <section className="flex flex-col gap-xs">
      <p>{t('pinyinType.wrongListLabel')}</p>
      <ol className="pinyin-type-syllables flex flex-col gap-xs">
        {syllables.map((syllable, index) => {
          const parts = [
            {
              key: 'initial',
              isWrong: syllable.isInitialWrong,
              typed: syllable.typed?.initial,
            },
            {
              key: 'final',
              isWrong: syllable.isFinalWrong,
              typed: syllable.typed?.final,
            },
            {
              key: 'tone',
              isWrong: syllable.isToneWrong,
              typed: syllable.typed?.tone?.toString(),
            },
          ].filter((part) => part.isWrong);
          return (
            // Danh sách tĩnh theo vị trí âm tiết, không reorder.
            <li key={index} className="pinyin-type-syllable">
              <ul className="flex flex-col gap-xs">
                {parts.map((part) => (
                  <li
                    key={part.key}
                    className="pinyin-type-part is-wrong flex gap-sm"
                  >
                    <span>{t(`pinyinType.parts.${part.key}`)}</span>
                    <span lang="zh-Latn-pinyin">{part.typed || missing}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
