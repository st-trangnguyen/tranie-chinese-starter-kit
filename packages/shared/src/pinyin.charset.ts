/*
 * Tập ký tự pinyin hợp lệ. Font pinyin (Baloo 2) đã được kiểm tra có đủ mọi ký tự trong tập này
 * (docs/04-specs/2026-11-04-design-system.md §2). Ký tự ngoài tập sẽ bị trình duyệt lấy từ font
 * khác và hiện lệch nét, nên content-check dùng hàm dưới để chặn.
 */

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const TONE_VOWELS = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü';
const PUNCTUATION = " '-,.?!;:";

export const PINYIN_CHARSET: ReadonlySet<string> = new Set([
  ...LETTERS,
  ...LETTERS.toUpperCase(),
  ...TONE_VOWELS,
  ...TONE_VOWELS.toUpperCase(),
  ...PUNCTUATION,
]);

/** Ký tự trong `text` mà font pinyin không hiển thị được: không trùng, theo thứ tự xuất hiện. */
export function findUnsupportedPinyinChars(text: string): string[] {
  const unsupported = [...text.normalize('NFC')].filter(
    (char) => !PINYIN_CHARSET.has(char),
  );
  return [...new Set(unsupported)];
}
