import { findUnsupportedPinyinChars } from './pinyin.charset';

describe('findUnsupportedPinyinChars', () => {
  it('should return nothing when pinyin uses tone marks and punctuation', () => {
    expect(findUnsupportedPinyinChars('nǐ hǎo, lǜsè. Lǚyóu!')).toEqual([]);
  });

  it('should return nothing when ü with tone marks is uppercase', () => {
    expect(findUnsupportedPinyinChars('Ǚ Ǜ Ā')).toEqual([]);
  });

  it('should return nothing when ǚ is written with combining marks (NFD)', () => {
    expect(findUnsupportedPinyinChars('lǚ')).toEqual([]);
  });

  it('should return the hanzi when one slips into pinyin', () => {
    expect(findUnsupportedPinyinChars('nǐ hǎo 你')).toEqual(['你']);
  });

  it('should return each unsupported char once in order of appearance', () => {
    expect(findUnsupportedPinyinChars('ê ŋ ê')).toEqual(['ê', 'ŋ']);
  });
});
