import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { hanCharacterSchema, type Lesson, type Word } from '@csk/shared';

import { PATHS } from '../lib/paths';
import {
  INTRO_LESSON_IDS,
  introLessonIdsInPath,
  lessonFile,
  readExistingLessons,
  readLesson,
  readStrokeIndex,
  readWords,
} from './introLessons.helpers';

const LESSON_10_ID = 'intro-10';
const LESSON_11_ID = 'intro-11';

interface StrokeWriteTarget {
  where: string;
  wordId: string;
  word: Word | undefined;
}

const strokeWriteTargets = (
  lesson: Lesson,
  wordsById: ReadonlyMap<string, Word>,
): StrokeWriteTarget[] =>
  lesson.exercises.flatMap((exercise) =>
    exercise.kind === 'stroke-write'
      ? [
          {
            where: `${lesson.id}/${exercise.id}`,
            wordId: exercise.wordId,
            word: wordsById.get(exercise.wordId),
          },
        ]
      : [],
  );

const readWordsById = (): ReadonlyMap<string, Word> =>
  new Map(readWords().map((word) => [word.id, word]));

const readExistingLessonOrFail = (lessonId: string): Lesson => {
  expect(
    existsSync(lessonFile(lessonId)),
    `chưa có bài ${lessonId} đã build`,
  ).toBe(true);
  return readLesson(lessonId);
};

describe('S7.1 câu viết trong 12 bài Nhập môn đã build', () => {
  it('S7.1-AC2 Bài "Nét cơ bản và thứ tự nét" có câu viết', () => {
    const lesson = readExistingLessonOrFail(LESSON_10_ID);

    const characters = strokeWriteTargets(lesson, readWordsById()).map(
      (target) => target.word?.hanzi,
    );

    expect(lesson.title).toBe('Nét cơ bản và thứ tự nét');
    expect(characters).toEqual(expect.arrayContaining(['人', '十']));
  });

  it('S7.1-AC2 Bài "30 bộ thủ phổ biến" có câu viết', () => {
    const lesson = readExistingLessonOrFail(LESSON_11_ID);

    const strokeWrites = lesson.exercises.filter(
      (exercise) => exercise.kind === 'stroke-write',
    );

    expect(lesson.title).toBe('30 bộ thủ phổ biến');
    expect(strokeWrites.length).toBeGreaterThanOrEqual(1);
  });

  it('S7.1-AC2 Câu viết của bài "30 bộ thủ phổ biến" là chữ trong từ điển', () => {
    const lesson = readExistingLessonOrFail(LESSON_11_ID);
    const strokeIndex = new Set(readStrokeIndex());

    const targets = strokeWriteTargets(lesson, readWordsById());
    const invalid = targets
      .filter(
        ({ word }) =>
          word === undefined ||
          word.hsk !== 1 ||
          !hanCharacterSchema.safeParse(word.hanzi).success ||
          !strokeIndex.has(word.hanzi),
      )
      .map(({ where, wordId }) => `${where}: "${wordId}"`);

    expect(targets.length).toBeGreaterThanOrEqual(1);
    expect(invalid).toEqual([]);
  });

  it('S7.1-AC3 Mọi câu viết của 12 bài có dữ liệu nét', () => {
    const lessonIds = introLessonIdsInPath();
    expect(lessonIds).toEqual(INTRO_LESSON_IDS);
    const wordsById = readWordsById();
    const strokeIndex = new Set(readStrokeIndex());

    const invalid = readExistingLessons(lessonIds)
      .flatMap((lesson) => strokeWriteTargets(lesson, wordsById))
      .filter(({ word }) => {
        const character = word?.hanzi ?? '';
        return (
          !hanCharacterSchema.safeParse(character).success ||
          !strokeIndex.has(character) ||
          !existsSync(join(PATHS.strokesOut, `${character}.json`))
        );
      })
      .map(({ where, wordId }) => `${where}: "${wordId}"`);

    expect(invalid).toEqual([]);
  });
});
