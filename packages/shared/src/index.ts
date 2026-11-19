// Public entry of @csk/shared. Schemas and utils are re-exported here as they are added.
export { PINYIN_CHARSET, findUnsupportedPinyinChars } from './pinyin.charset';
export {
  AUDIO_SPEED_OPTIONS,
  DAILY_GOAL_OPTIONS,
  DEFAULT_SETTINGS,
  LESSON_PROGRESS_STATUSES,
  audioSpeedSchema,
  dailyGoalMinutesSchema,
  dailyStatSchema,
  lessonProgressSchema,
  localDateKeySchema,
  parseSettings,
  settingsSchema,
} from './progress.schema';
export type {
  AudioSpeed,
  DailyGoalMinutes,
  DailyStat,
  LessonProgress,
  LessonStatus,
  Settings,
} from './progress.schema';
export { comparePinyin, parsePinyin } from './pinyin.compare';
export type {
  PinyinComparison,
  PinyinSyllable,
  PinyinSyllableDiff,
} from './pinyin.compare';
export {
  convertTypedPinyin,
  countPinyinSyllables,
  isToneMarkedPinyin,
  numberedToToneMarks,
  pinyinKey,
  toneOfPinyin,
} from './pinyin.utils';
export type { Tone } from './pinyin.utils';
export {
  LESSON_TYPES,
  VOICES,
  contentRootSchema,
  exerciseSchema,
  lessonSchema,
  sentenceSchema,
  stageSchema,
  unitSchema,
  voiceSchema,
  wordSchema,
} from './content.schema';
export type {
  ContentRoot,
  Exercise,
  ExerciseKind,
  Lesson,
  Sentence,
  Stage,
  Unit,
  Voice,
  Word,
} from './content.schema';
export {
  hanCharacterSchema,
  strokeDataSchema,
  strokeIndexSchema,
} from './stroke.schema';
export type { StrokeData, StrokeIndex } from './stroke.schema';
export { INTRO_STAGE_ID, audioIndexSchema } from './audio-index.schema';
export type { AudioIndex } from './audio-index.schema';
