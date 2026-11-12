import { describe, expect, it } from 'vitest';

import {
  countPinyinSyllables,
  isToneMarkedPinyin,
  numberedToToneMarks,
  pinyinKey,
  toneOfPinyin,
} from './pinyin.utils';

describe('numberedToToneMarks', () => {
  it('places the mark on a/e first, then on o of ou, else on the last vowel', () => {
    expect(numberedToToneMarks('ni3 hao3')).toBe('nǐ hǎo');
    expect(numberedToToneMarks('mei2')).toBe('méi');
    expect(numberedToToneMarks('dou1')).toBe('dōu');
    expect(numberedToToneMarks('dui4')).toBe('duì');
    expect(numberedToToneMarks('liu2')).toBe('liú');
  });

  it('handles ü written as u: or v, the neutral tone and capitals', () => {
    expect(numberedToToneMarks('lu:4')).toBe('lǜ');
    expect(numberedToToneMarks('nv3')).toBe('nǚ');
    expect(numberedToToneMarks('ma1 ma5')).toBe('mā ma');
    expect(numberedToToneMarks('Bei3 jing1')).toBe('Běi jīng');
  });

  it('leaves tokens that are not numbered syllables untouched', () => {
    expect(numberedToToneMarks('xx ,')).toBe('xx ,');
  });
});

describe('isToneMarkedPinyin', () => {
  it('accepts marked pinyin and neutral-tone syllables', () => {
    expect(isToneMarkedPinyin('àihào')).toBe(true);
    expect(isToneMarkedPinyin('ba')).toBe(true);
    expect(isToneMarkedPinyin('bù kèqi')).toBe(true);
  });

  it('rejects empty, numbered or unsupported pinyin', () => {
    expect(isToneMarkedPinyin('  ')).toBe(false);
    expect(isToneMarkedPinyin('ai4')).toBe(false);
    expect(isToneMarkedPinyin('hǎo（）')).toBe(false);
  });
});

describe('pinyinKey', () => {
  it('ignores case, spaces, hyphens and apostrophes', () => {
    expect(pinyinKey("Xī'ān")).toBe(pinyinKey('xī ān'));
    expect(pinyinKey('bù kèqi')).toBe('bùkèqi');
  });
});

describe('toneOfPinyin', () => {
  it('S4.1-AC1: âm tiết không có dấu thanh là thanh nhẹ (5)', () => {
    expect(toneOfPinyin('ma')).toBe(5);
  });

  it('S4.1-AC1: đọc thanh 1 đến 4 từ dấu thanh', () => {
    expect(toneOfPinyin('bā')).toBe(1);
    expect(toneOfPinyin('bái')).toBe(2);
    expect(toneOfPinyin('bǎi')).toBe(3);
    expect(toneOfPinyin('bà')).toBe(4);
  });
});

describe('countPinyinSyllables', () => {
  it('S4.1-AC1: từ một âm tiết đếm là 1', () => {
    expect(countPinyinSyllables('nǐ')).toBe(1);
    expect(countPinyinSyllables('xiān')).toBe(1);
    expect(countPinyinSyllables('huār')).toBe(1);
  });

  it('S4.1-AC1: từ nhiều âm tiết đếm theo cụm nguyên âm, kể cả viết liền hay cách nhau', () => {
    expect(countPinyinSyllables('bàba')).toBe(2);
    expect(countPinyinSyllables('nǐ hǎo')).toBe(2);
  });
});
