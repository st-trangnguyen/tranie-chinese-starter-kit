import { findUnsupportedPinyinChars } from './pinyin.charset';

const TONE_MARKS: Readonly<Record<string, readonly string[]>> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

const VOWELS = 'aeiouü';
const NUMBERED_SYLLABLE = /^([a-zA-ZüÜ:]+)([1-5])?$/;

/**
 * Rule đặt dấu thanh: ưu tiên `a`/`e`; `ou` đặt trên `o`; còn lại đặt trên nguyên âm cuối.
 */
function markVowelIndex(syllable: string): number {
  const lower = syllable.toLowerCase();
  const aOrE = lower.search(/[ae]/);
  if (aOrE !== -1) {
    return aOrE;
  }
  const ou = lower.indexOf('ou');
  if (ou !== -1) {
    return ou;
  }
  return [...lower].findLastIndex((char) => VOWELS.includes(char));
}

function applyTone(syllable: string, tone: number): string {
  const index = markVowelIndex(syllable);
  if (index === -1 || tone < 1 || tone > 4) {
    return syllable;
  }
  const chars = [...syllable];
  const vowel = chars[index];
  const marks = TONE_MARKS[vowel.toLowerCase()];
  if (marks === undefined) {
    return syllable;
  }
  const marked = marks[tone - 1];
  chars[index] = vowel === vowel.toUpperCase() ? marked.toUpperCase() : marked;
  return chars.join('');
}

/** Một âm tiết dạng số (`hao3`, `lu:4`, `ma5`) → dạng dấu. Không khớp dạng số thì giữ nguyên. */
function convertSyllable(token: string): string {
  const match = NUMBERED_SYLLABLE.exec(token);
  if (match === null) {
    return token;
  }
  const letters = match[1].replace(/u:|v/g, 'ü').replace(/U:|V/g, 'Ü');
  const tone = match[2] === undefined ? 5 : Number(match[2]);
  return applyTone(letters, tone);
}

/** `'ni3 hao3'` → `'nǐ hǎo'`. Âm tiết cách nhau bằng khoảng trắng (định dạng CC-CEDICT/CVDICT). */
export function numberedToToneMarks(numbered: string): string {
  return numbered.trim().split(/\s+/).map(convertSyllable).join(' ');
}

/**
 * Rule (S2.1 AC2): pinyin hợp lệ khi không rỗng, không còn số thanh (`hao3`) và mọi ký tự hiển
 * thị được bằng font pinyin. Âm tiết thanh nhẹ (`ba`, `le`) không có dấu là đúng chuẩn.
 */
export function isToneMarkedPinyin(pinyin: string): boolean {
  const text = pinyin.normalize('NFC').trim();
  return (
    text.length > 0 &&
    !/\d/.test(text) &&
    findUnsupportedPinyinChars(text).length === 0
  );
}

/** Khóa so khớp pinyin giữa các nguồn: NFC, chữ thường, bỏ khoảng trắng/gạch nối/nháy. */
export function pinyinKey(pinyin: string): string {
  return pinyin
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s'’-]/g, '');
}

export type Tone = 1 | 2 | 3 | 4 | 5;

const TONE_BY_MARK: ReadonlyMap<string, Tone> = new Map(
  Object.values(TONE_MARKS).flatMap((marks) =>
    marks.map((mark, index): [string, Tone] => [mark, (index + 1) as Tone]),
  ),
);

/** Rule (S4.1 AC1): thanh của pinyin theo dấu thanh đầu tiên; không có dấu là thanh nhẹ (5). */
export function toneOfPinyin(pinyin: string): Tone {
  for (const char of pinyin.normalize('NFC').toLowerCase()) {
    const tone = TONE_BY_MARK.get(char);
    if (tone !== undefined) {
      return tone;
    }
  }
  return 5;
}

const VOWEL_CLUSTER = /[aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+/g;

/**
 * Rule (S4.1 AC1): số âm tiết của pinyin = số cụm nguyên âm liền nhau (`bàba` 2, `xiān` 1,
 * `huār` 1). Khoảng trắng, `'` và `-` ngắt cụm.
 */
export function countPinyinSyllables(pinyin: string): number {
  return (
    pinyin.normalize('NFC').toLowerCase().match(VOWEL_CLUSTER)?.length ?? 0
  );
}
