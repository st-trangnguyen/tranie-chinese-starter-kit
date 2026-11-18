import type {
  AudioIndex,
  Exercise,
  Lesson,
  Sentence,
  Stage,
  Word,
} from '@csk/shared';

/** Dung lượng (byte) của một file audio trong `assets/`, `undefined` nếu file chưa có. */
export type AudioBytes = (path: string) => number | undefined;

/** Id từ và câu mà một bài tập phát. */
interface AudioSources {
  wordIds: string[];
  sentenceIds: string[];
}

function exerciseAudioSources(exercise: Exercise): AudioSources {
  switch (exercise.kind) {
    case 'tone-choice':
    case 'pinyin-type':
      return { wordIds: [exercise.wordId], sentenceIds: [] };
    case 'sound-pair':
      return { wordIds: [...exercise.wordIds], sentenceIds: [] };
    case 'speak':
      return {
        wordIds: exercise.wordId === undefined ? [] : [exercise.wordId],
        sentenceIds:
          exercise.sentenceId === undefined ? [] : [exercise.sentenceId],
      };
    default:
      // stroke-write: không có nút Nghe.
      return { wordIds: [], sentenceIds: [] };
  }
}

/**
 * Rule (S8.4 AC1): audio mà một bài phát, theo thứ tự bài tập. tone-choice, pinyin-type: audio
 * từ; sound-pair: hai từ; speak: từ hoặc câu; stroke-write: không có audio.
 */
export function lessonAudioPaths(
  lesson: Lesson,
  wordById: ReadonlyMap<string, Word>,
  sentenceById: ReadonlyMap<string, Sentence>,
): string[] {
  return lesson.exercises.flatMap((exercise) => {
    const { wordIds, sentenceIds } = exerciseAudioSources(exercise);
    const wordAudios = wordIds.flatMap((id) => wordById.get(id)?.audio ?? []);
    const sentenceAudios = sentenceIds.flatMap(
      (id) => sentenceById.get(id)?.audio ?? [],
    );
    return [...wordAudios, ...sentenceAudios];
  });
}

/**
 * Danh sách audio theo chủ đề (design D1, D2) cho `audio-index.json`.
 * Rule (S8.4 AC1): audio của nhóm = audio các bài của nhóm, không trùng, theo thứ tự bài; dung
 * lượng lấy từ file, file chưa có ghi 0.
 */
export function buildAudioIndex(
  stages: readonly Stage[],
  lessons: readonly Lesson[],
  wordById: ReadonlyMap<string, Word>,
  sentenceById: ReadonlyMap<string, Sentence>,
  audioBytes: AudioBytes,
): AudioIndex {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const unitEntries = stages
    .flatMap((stage) => stage.units)
    .map((unit): [string, string[]] => {
      const paths = unit.lessonIds.flatMap((lessonId) => {
        const lesson = lessonById.get(lessonId);
        return lesson === undefined
          ? []
          : lessonAudioPaths(lesson, wordById, sentenceById);
      });
      return [unit.id, [...new Set(paths)]];
    });
  const allPaths = new Set(unitEntries.flatMap(([, paths]) => paths));
  const bytes = Object.fromEntries(
    [...allPaths].map((path) => [path, audioBytes(path) ?? 0]),
  );
  return { units: Object.fromEntries(unitEntries), bytes, precached: [] };
}
