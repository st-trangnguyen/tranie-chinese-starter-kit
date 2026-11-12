import { PINYIN_INITIALS, splitPinyinSyllables } from './pinyin.syllables';
import {
  convertTypedPinyin,
  pinyinKey,
  toneOfPinyin,
  type Tone,
} from './pinyin.utils';

export interface PinyinSyllable {
  initial: string;
  final: string;
  tone: Tone;
}

export interface PinyinSyllableDiff {
  /** null: người học gõ thừa. */
  expected: PinyinSyllable | null;
  /** null: người học gõ thiếu. */
  typed: PinyinSyllable | null;
  isInitialWrong: boolean;
  isFinalWrong: boolean;
  isToneWrong: boolean;
}

export interface PinyinComparison {
  isCorrect: boolean;
  syllables: PinyinSyllableDiff[];
}

function normalizeTyped(text: string): string {
  return pinyinKey(convertTypedPinyin(text)).replace(/u:|v/g, 'ü');
}

const TONE_MARK_PATTERN = /[\u0300\u0301\u0304\u030c]/g;

function stripToneMark(char: string): string {
  return char.normalize('NFD').replace(TONE_MARK_PATTERN, '').normalize('NFC');
}

function toSyllable(base: string, tone: Tone): PinyinSyllable {
  const initial = PINYIN_INITIALS.find((item) => base.startsWith(item)) ?? '';
  return { initial, final: base.slice(initial.length), tone };
}

function parsePiece(piece: string): PinyinSyllable[] {
  const chars = [
    ...convertTypedPinyin(piece).replace(/u:|v/g, 'ü').normalize('NFC'),
  ];
  const base = chars.map(stripToneMark).join('');
  let offset = 0;
  return splitPinyinSyllables(base).map((part) => {
    const length = [...part].length;
    const marked = chars.slice(offset, offset + length).join('');
    offset += length;
    return toSyllable(part, toneOfPinyin(marked));
  });
}

/**
 * Rule (S4.3 AC3): chuẩn hóa (NFC, chữ thường, đổi số → dấu), tách theo khoảng trắng/`'`/`-`,
 * rồi tách từng âm tiết thành thanh mẫu, vận mẫu, thanh điệu. Không bao giờ throw.
 */
export function parsePinyin(text: string): PinyinSyllable[] {
  return text
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .split(/[\s'’-]+/)
    .filter((piece) => piece !== '')
    .flatMap(parsePiece);
}

function diffSyllable(
  typed: PinyinSyllable | null,
  expected: PinyinSyllable | null,
): PinyinSyllableDiff {
  if (typed === null || expected === null) {
    return {
      typed,
      expected,
      isInitialWrong: true,
      isFinalWrong: true,
      isToneWrong: true,
    };
  }
  return {
    typed,
    expected,
    isInitialWrong: typed.initial !== expected.initial,
    isFinalWrong: typed.final !== expected.final,
    isToneWrong: typed.tone !== expected.tone,
  };
}

/**
 * Rule (S4.3 AC2): đúng khi khóa pinyin của chuỗi gõ (sau đổi số → dấu, `v`/`u:` → `ü`)
 * bằng khóa của đáp án; chuỗi trống không đúng.
 * Rule (S4.3 AC3): ghép âm tiết theo vị trí; phần nào lệch thì cờ tương ứng true; âm tiết
 * thiếu hoặc thừa có cả ba cờ true. Khi đúng, mọi cờ false.
 */
export function comparePinyin(
  typed: string,
  expected: string,
): PinyinComparison {
  const typedKey = normalizeTyped(typed);
  const isCorrect = typedKey !== '' && typedKey === normalizeTyped(expected);
  const typedSyllables = parsePinyin(typed);
  const expectedSyllables = parsePinyin(expected);
  const count = Math.max(typedSyllables.length, expectedSyllables.length);
  const syllables = Array.from({ length: count }, (_, index) => {
    const expectedItem = expectedSyllables[index] ?? null;
    return isCorrect
      ? {
          typed: expectedItem,
          expected: expectedItem,
          isInitialWrong: false,
          isFinalWrong: false,
          isToneWrong: false,
        }
      : diffSyllable(typedSyllables[index] ?? null, expectedItem);
  });
  return { isCorrect, syllables };
}
