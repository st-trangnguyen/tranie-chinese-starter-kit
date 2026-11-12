import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { wordSchema } from './content.schema';
import { countPinyinSyllables } from './pinyin.utils';
import { splitPinyinSyllables } from './pinyin.syllables';

const WORDS_PATH = fileURLToPath(
  new URL('../../../apps/web/src/assets/content/words.json', import.meta.url),
);

/** Pinyin có dấu → chữ thường, không thanh, ü giữ nguyên, tách theo khoảng trắng/`'`/`-`. */
function toToneless(pinyin: string): string[] {
  return pinyin
    .normalize('NFC')
    .toLowerCase()
    .replace(/[üǖǘǚǜ]/g, 'v')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/v/g, 'ü')
    .split(/[\s'’-]+/)
    .filter((part) => part.length > 0);
}

describe('splitPinyinSyllables', () => {
  it('should split two syllables when the text is nihao', () => {
    expect(splitPinyinSyllables('nihao')).toEqual(['ni', 'hao']);
  });

  it('should split repeated syllables when the text is baba', () => {
    expect(splitPinyinSyllables('baba')).toEqual(['ba', 'ba']);
  });

  it('should split three syllables when the text is duibuqi', () => {
    expect(splitPinyinSyllables('duibuqi')).toEqual(['dui', 'bu', 'qi']);
  });

  it('should keep erhua as one syllable when the text is huar', () => {
    expect(splitPinyinSyllables('huar')).toEqual(['huar']);
  });

  it('should accept lüe, nü and ju as valid single syllables', () => {
    expect(splitPinyinSyllables('lüe')).toEqual(['lüe']);
    expect(splitPinyinSyllables('nü')).toEqual(['nü']);
    expect(splitPinyinSyllables('ju')).toEqual(['ju']);
  });

  it('should prefer the longest match when the text is fangan', () => {
    expect(splitPinyinSyllables('fangan')).toEqual(['fang', 'an']);
  });

  it('should return one piece and not throw when the text cannot be split', () => {
    expect(() => splitPinyinSyllables('xyz')).not.toThrow();
    expect(splitPinyinSyllables('xyz')).toEqual(['xyz']);
  });

  it('should split every pinyin in words.json into countPinyinSyllables syllables', () => {
    const raw: unknown = JSON.parse(readFileSync(WORDS_PATH, 'utf8'));
    const words = wordSchema.array().parse(raw);
    expect(words.length).toBeGreaterThan(0);

    const mismatches = words
      .map((word) => {
        const parts = toToneless(word.pinyin).map((part) =>
          splitPinyinSyllables(part),
        );
        return {
          pinyin: word.pinyin,
          actual: parts.reduce((sum, syllables) => sum + syllables.length, 0),
          expected: countPinyinSyllables(word.pinyin),
        };
      })
      .filter((item) => item.actual !== item.expected);

    expect(mismatches).toEqual([]);
  });
});
