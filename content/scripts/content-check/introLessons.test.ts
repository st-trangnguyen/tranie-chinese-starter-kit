import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { PATHS } from '../lib/paths';
import {
  AUDIO_KINDS,
  hasToneSandhi,
  INTRO_LESSON_IDS,
  INTRO_LESSON_TITLES,
  INTRO_STAGE_TITLE,
  INTRO_UNIT_ID,
  INTRO_UNIT_TITLE,
  introLessonIdsInPath,
  lessonFile,
  LISTEN_KINDS,
  OLD_SAMPLE_LESSON_TITLE,
  readContentRoot,
  readExistingLessons,
  readLesson,
  readSentences,
  readWords,
  sentenceIdsOf,
  SUPPORTED_KINDS,
  wordIdsOf,
} from './introLessons.helpers';

/** Đọc 12 bài Nhập môn theo lộ trình; assertion số bài đứng trước mọi kiểm tra từng bài. */
const readIntroLessons = () => {
  const lessonIds = introLessonIdsInPath();
  expect(lessonIds).toEqual(INTRO_LESSON_IDS);
  return readExistingLessons(lessonIds);
};

const hasAudioFile = (audio: string): boolean => {
  const file = join(PATHS.assets, audio);
  return existsSync(file) && statSync(file).size > 0;
};

describe('S7.1 nội dung 12 bài Nhập môn đã build', () => {
  it('S7.1-AC2 Lộ trình có đủ 12 bài Nhập môn đúng thứ tự', () => {
    const [firstStage] = readContentRoot().stages;

    expect(firstStage?.title).toBe(INTRO_STAGE_TITLE);
    expect(
      firstStage?.units.map((unit) => ({ id: unit.id, title: unit.title })),
    ).toEqual([{ id: INTRO_UNIT_ID, title: INTRO_UNIT_TITLE }]);
    expect(firstStage?.units[0]?.lessonIds).toEqual(INTRO_LESSON_IDS);
    expect(
      readExistingLessons(INTRO_LESSON_IDS).map((lesson) => lesson.title),
    ).toEqual([...INTRO_LESSON_TITLES]);
  });

  it('S7.1-AC2 Không còn bài mẫu cũ', () => {
    const allLessonIds = readContentRoot().stages.flatMap((stage) =>
      stage.units.flatMap((unit) => unit.lessonIds),
    );

    const titles = readExistingLessons(allLessonIds).map(
      (lesson) => lesson.title,
    );

    expect(titles).not.toContain(OLD_SAMPLE_LESSON_TITLE);
  });

  it('S7.1-AC1 Mỗi bài có ít nhất 2 dạng bài tập', () => {
    const lessons = readIntroLessons();

    const lessonsWithFewKinds = lessons
      .filter(
        (lesson) =>
          new Set(lesson.exercises.map((exercise) => exercise.kind)).size < 2,
      )
      .map((lesson) => lesson.id);

    expect(lessonsWithFewKinds).toEqual([]);
  });

  it('S7.1-AC1 Mỗi bài có câu nghe', () => {
    const lessons = readIntroLessons();

    const lessonsWithoutListen = lessons
      .filter(
        (lesson) =>
          !lesson.exercises.some((exercise) =>
            LISTEN_KINDS.includes(exercise.kind),
          ),
      )
      .map((lesson) => lesson.id);

    expect(lessonsWithoutListen).toEqual([]);
  });

  it('S7.1-AC1 Mọi câu thuộc dạng đã hỗ trợ', () => {
    const lessons = readIntroLessons();

    const unsupported = lessons.flatMap((lesson) =>
      lesson.exercises
        .filter((exercise) => !SUPPORTED_KINDS.includes(exercise.kind))
        .map((exercise) => `${lesson.id}/${exercise.id}: ${exercise.kind}`),
    );

    expect(unsupported).toEqual([]);
  });

  it('S7.1-AC1 Mọi từ và câu của bài đều có audio', () => {
    const lessons = readIntroLessons();
    const wordsById = new Map(readWords().map((word) => [word.id, word]));
    const sentencesById = new Map(
      readSentences().map((sentence) => [sentence.id, sentence]),
    );

    const missingAudio = lessons.flatMap((lesson) =>
      lesson.exercises
        .filter((exercise) => AUDIO_KINDS.includes(exercise.kind))
        .flatMap((exercise) => {
          const where = `${lesson.id}/${exercise.id}`;
          const wordIssues = wordIdsOf(exercise)
            .filter((id) => {
              const word = wordsById.get(id);
              return word === undefined || !hasAudioFile(word.audio);
            })
            .map((id) => `${where}: từ "${id}"`);
          const sentenceIssues = sentenceIdsOf(exercise)
            .filter((id) => {
              const sentence = sentencesById.get(id);
              return sentence === undefined || !hasAudioFile(sentence.audio);
            })
            .map((id) => `${where}: câu "${id}"`);
          return [...wordIssues, ...sentenceIssues];
        }),
    );

    expect(missingAudio).toEqual([]);
  });

  describe('bài 2 "Thanh nhẹ và biến điệu (3-3, 不, 一)"', () => {
    const LESSON_2_ID = 'intro-02';

    it('S7.1-AC1 Bài 2 không hỏi từ có biến điệu trong câu chọn thanh và gõ pinyin', () => {
      expect(
        existsSync(lessonFile(LESSON_2_ID)),
        `chưa có bài ${LESSON_2_ID} đã build`,
      ).toBe(true);
      const lesson = readLesson(LESSON_2_ID);
      const wordsById = new Map(readWords().map((word) => [word.id, word]));

      const sandhiQuestions = lesson.exercises
        .filter(
          (exercise) =>
            exercise.kind === 'tone-choice' || exercise.kind === 'pinyin-type',
        )
        .flatMap((exercise) =>
          wordIdsOf(exercise)
            .map((id) => wordsById.get(id))
            .filter((word) => word !== undefined && hasToneSandhi(word))
            .map((word) => `${exercise.id}: ${word?.hanzi ?? ''}`),
        );

      expect(lesson.title).toBe(INTRO_LESSON_TITLES[1]);
      expect(sandhiQuestions).toEqual([]);
    });

    it('S7.1-AC1 Bài 2 có câu nói theo mẫu với từ có biến điệu', () => {
      expect(
        existsSync(lessonFile(LESSON_2_ID)),
        `chưa có bài ${LESSON_2_ID} đã build`,
      ).toBe(true);
      const lesson = readLesson(LESSON_2_ID);
      const wordsById = new Map(readWords().map((word) => [word.id, word]));
      const sentencesById = new Map(
        readSentences().map((sentence) => [sentence.id, sentence]),
      );

      const sandhiSpeaks = lesson.exercises
        .filter((exercise) => exercise.kind === 'speak')
        .filter((exercise) =>
          [
            ...wordIdsOf(exercise).map((id) => wordsById.get(id)),
            ...sentenceIdsOf(exercise).map((id) => sentencesById.get(id)),
          ].some((text) => text !== undefined && hasToneSandhi(text)),
        );

      expect(sandhiSpeaks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
