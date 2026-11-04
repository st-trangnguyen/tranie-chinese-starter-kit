import type { Word } from '@csk/shared';

import { audioJob, type AudioJob } from './audio';
import type { HskEntry } from '../content-fetch/hskList';
import type { TtsOverrides, ViMeanings } from '../lib/authored.schema';

export interface BuiltWords {
  words: Word[];
  audioJobs: AudioJob[];
}

/**
 * Ghép danh sách HSK với nghĩa tiếng Việt đã soạn. Audio đọc `tts-overrides` nếu có (chữ đa
 * âm), không thì đọc chính hanzi.
 */
export function buildWords(
  entries: readonly HskEntry[],
  meanings: ViMeanings,
  overrides: TtsOverrides,
  hsk: number,
): BuiltWords {
  const built = entries.map((entry) => {
    const job = audioJob(overrides[entry.id] ?? entry.hanzi, 'female');
    const meaning = meanings[entry.id];
    const word: Word = {
      id: entry.id,
      hanzi: entry.hanzi,
      pinyin: entry.pinyin,
      vi: meaning?.vi ?? [],
      viReviewed: meaning?.reviewed ?? false,
      hsk,
      audio: job.path,
    };
    return { word, job };
  });
  return {
    words: built.map(({ word }) => word),
    audioJobs: built.map(({ job }) => job),
  };
}
