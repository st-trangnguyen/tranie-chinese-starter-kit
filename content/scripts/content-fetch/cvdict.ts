import { numberedToToneMarks, pinyinKey } from '@csk/shared';

import type { HskEntry } from './hskList';

/** Một dòng CVDICT (định dạng CEDICT): `phồn giản [pin1 yin1] /nghĩa 1/nghĩa 2/`. */
export interface CvdictEntry {
  simplified: string;
  pinyin: string;
  senses: string[];
}

export interface CvdictMatch {
  /** Pinyin của mục CVDICT được chọn, để người review đối chiếu. */
  pinyin: string;
  vi: string[];
}

const LINE = /^\S+ (\S+) \[([^\]]+)\] \/(.*)\/$/;
const MAX_SENSES = 4;

/** Nghĩa không dùng được cho người học: biến thể chữ, họ, lượng từ, viết tắt, tham chiếu. */
const NOISE_SENSE =
  /^(biến thể|họ \[|họ [A-ZĐ]|LT:|viết tắt|xem |cũng viết|cách viết|dạng cổ|phồn thể)/i;

export function parseCvdict(
  text: string,
  keep: ReadonlySet<string>,
): CvdictEntry[] {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('#'))
    .flatMap((line) => {
      const match = LINE.exec(line);
      if (match === null || !keep.has(match[1])) {
        return [];
      }
      return [
        {
          simplified: match[1],
          pinyin: numberedToToneMarks(match[2]).normalize('NFC'),
          senses: match[3].split('/').filter((sense) => sense.length > 0),
        },
      ];
    });
}

/** Rule: giữ tối đa 4 nghĩa đầu, bỏ nghĩa nhiễu (biến thể, họ, lượng từ…), không trùng. */
export function cleanSenses(senses: readonly string[]): string[] {
  const cleaned = senses
    .map((sense) => sense.trim())
    .filter((sense) => sense.length > 0 && !NOISE_SENSE.test(sense));
  return [...new Set(cleaned)].slice(0, MAX_SENSES);
}

const withoutTones = (pinyin: string): string =>
  pinyinKey(pinyin).normalize('NFD').replace(/\p{M}/gu, '');

/**
 * Chọn mục CVDICT cho một từ HSK: khớp pinyin có dấu trước, rồi khớp bỏ dấu (biến điệu như
 * `yī/yí`), cuối cùng là mục duy nhất viết thường. Không chọn được thì trả `undefined`.
 */
export function matchCvdict(
  word: HskEntry,
  entries: readonly CvdictEntry[],
): CvdictMatch | undefined {
  const candidates = entries.filter((entry) => entry.simplified === word.hanzi);
  const exact = candidates.filter(
    (entry) => pinyinKey(entry.pinyin) === pinyinKey(word.pinyin),
  );
  const toneless = candidates.filter(
    (entry) => withoutTones(entry.pinyin) === withoutTones(word.pinyin),
  );
  const lowercase = candidates.filter(
    (entry) => entry.pinyin === entry.pinyin.toLowerCase(),
  );
  const fallback = lowercase.length === 1 ? lowercase : [];
  const [first] =
    [exact, toneless, fallback].find((list) => list.length > 0) ?? [];
  if (first === undefined) {
    return undefined;
  }
  const picked = exact.length > 0 ? exact : [first];
  return {
    pinyin: first.pinyin,
    vi: cleanSenses(picked.flatMap((entry) => entry.senses)),
  };
}

/** Từ có đuôi 儿 (`好玩儿`) mà CVDICT ghi không có 儿 thì tra bản bỏ 儿 (`好玩`). */
export function withoutErhua(word: HskEntry): HskEntry | undefined {
  if (word.hanzi.length < 2 || !word.hanzi.endsWith('儿')) {
    return undefined;
  }
  return {
    ...word,
    hanzi: word.hanzi.slice(0, -1),
    pinyin: word.pinyin.replace(/r$/, ''),
  };
}

/** Rule: khớp từ nguyên dạng trước; không có nghĩa dùng được thì khớp dạng bỏ 儿. */
export function matchCvdictWithErhua(
  word: HskEntry,
  entries: readonly CvdictEntry[],
): CvdictMatch | undefined {
  const direct = matchCvdict(word, entries);
  const base = withoutErhua(word);
  if ((direct?.vi.length ?? 0) > 0 || base === undefined) {
    return direct;
  }
  return matchCvdict(base, entries) ?? direct;
}
