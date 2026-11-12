import type {
  ContentRoot,
  Exercise,
  Lesson,
  Sentence,
  Word,
} from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { ExerciseContent } from '@shared/models/exercise.model';
import type { PathMap } from '@shared/models/learning-path.model';
import { listLessonIdsInOrder } from '@shared/utils/learning-path.utils';

export class ContentService {
  constructor(private readonly source: ContentSource = contentSource) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────

  private readContentRoot(): Promise<ContentRoot> {
    return this.source.getContentRoot();
  }

  private readLesson(lessonId: string): Promise<Lesson> {
    return this.source.getLesson(lessonId);
  }

  private readWords(): Promise<Word[]> {
    return this.source.getWords();
  }

  private readSentences(): Promise<Sentence[]> {
    return this.source.getSentences();
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────
  // Thứ tự bài dùng chung `listLessonIdsInOrder` (shared/utils).

  // Rule: mỗi dạng bài tham chiếu từ/câu bằng `wordId`, `wordIds` hoặc `sentenceId`;
  // đây là các ID cần nạp để dựng câu, giữ thứ tự khai báo.
  collectContentIds(exercise: Exercise): {
    wordIds: string[];
    sentenceIds: string[];
  } {
    if ('wordIds' in exercise) {
      return { wordIds: [...exercise.wordIds], sentenceIds: [] };
    }
    const wordIds = exercise.wordId === undefined ? [] : [exercise.wordId];
    const sentenceIds =
      'sentenceId' in exercise && exercise.sentenceId !== undefined
        ? [exercise.sentenceId]
        : [];
    return { wordIds, sentenceIds };
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async getPathMap(): Promise<PathMap> {
    try {
      const root = await this.readContentRoot();
      const lessons = await Promise.all(
        listLessonIdsInOrder(root.stages).map((lessonId) =>
          this.readLesson(lessonId),
        ),
      );
      return {
        stages: root.stages,
        lessonTitles: new Map(
          lessons.map((lesson) => [lesson.id, lesson.title]),
        ),
      };
    } catch (error) {
      throw new Error('Không tải được lộ trình học.', { cause: error });
    }
  }

  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      return await this.readLesson(lessonId);
    } catch (error) {
      throw new Error('Không mở được bài học.', { cause: error });
    }
  }

  async getExerciseContents(
    lesson: Lesson,
  ): Promise<ReadonlyMap<string, ExerciseContent>> {
    let words: Word[];
    let sentences: Sentence[];
    try {
      [words, sentences] = await Promise.all([
        this.readWords(),
        this.readSentences(),
      ]);
    } catch (error) {
      throw new Error('Không tải được nội dung bài tập.', { cause: error });
    }
    const wordsById = new Map(words.map((word) => [word.id, word]));
    const sentencesById = new Map(
      sentences.map((sentence) => [sentence.id, sentence]),
    );

    return new Map(
      lesson.exercises.map((exercise) => {
        const ids = this.collectContentIds(exercise);
        return [
          exercise.id,
          {
            words: ids.wordIds.map((id) => {
              const word = wordsById.get(id);
              if (!word) {
                throw new Error(
                  `Không tìm thấy từ "${id}" của câu "${exercise.id}".`,
                );
              }
              return word;
            }),
            sentences: ids.sentenceIds.map((id) => {
              const sentence = sentencesById.get(id);
              if (!sentence) {
                throw new Error(
                  `Không tìm thấy câu "${id}" của câu "${exercise.id}".`,
                );
              }
              return sentence;
            }),
          },
        ];
      }),
    );
  }
}
