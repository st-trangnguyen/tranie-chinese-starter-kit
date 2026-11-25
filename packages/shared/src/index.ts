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
  dailyStatStrictSchema,
  lessonProgressSchema,
  lessonProgressStrictSchema,
  localDateKeySchema,
  parseSettings,
  settingsFieldSchemas,
  settingsSchema,
  settingsStrictSchema,
} from './progress.schema';
export type {
  AudioSpeed,
  DailyGoalMinutes,
  DailyStat,
  LessonProgress,
  LessonStatus,
  Settings,
} from './progress.schema';
export {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_FORMAT_VERSION,
  progressBackupEnvelopeSchema,
  progressBackupV1Schema,
} from './progress-backup.schema';
export type {
  ProgressBackupFile,
  ProgressSnapshot,
} from './progress-backup.schema';
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
export {
  CARD_FACETS,
  CARD_STATES,
  reviewCardId,
  reviewCardSchema,
  writtenCharacterSchema,
} from './review-card.schema';
export type { CardFacet, CardState, ReviewCard } from './review-card.schema';
export { INTRO_STAGE_ID, audioIndexSchema } from './audio-index.schema';
export type { AudioIndex } from './audio-index.schema';
