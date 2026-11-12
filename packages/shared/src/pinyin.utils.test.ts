import { describe, expect, it } from 'vitest';

import {
  convertTypedPinyin,
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

describe('convertTypedPinyin', () => {
  it('S4.3-AC1: gõ ni3 thì hiện nǐ', () => {
    expect(convertTypedPinyin('ni3')).toBe('nǐ');
  });

  it('S4.3-AC1: gõ liền nhiều âm tiết thì đổi từng âm tiết', () => {
    expect(convertTypedPinyin('ni3hao3')).toBe('nǐhǎo');
    expect(convertTypedPinyin('ni3 hao3')).toBe('nǐ hǎo');
  });

  it('S4.3-AC1: gõ v hoặc u: thay cho ü', () => {
    expect(convertTypedPinyin('lv4')).toBe('lǜ');
    expect(convertTypedPinyin('lu:4')).toBe('lǜ');
    expect(convertTypedPinyin('jv4')).toBe('jù');
  });

  it('S4.3-AC1: số 5 là thanh nhẹ nên không có dấu', () => {
    expect(convertTypedPinyin('ma5')).toBe('ma');
  });

  it('S4.3-AC1: số đứng sai chỗ thì giữ nguyên', () => {
    expect(convertTypedPinyin('3')).toBe('3');
    expect(convertTypedPinyin('3ni')).toBe('3ni');
    expect(convertTypedPinyin('ni 3')).toBe('ni 3');
    expect(convertTypedPinyin('xyz3')).toBe('xyz3');
  });

  it('S4.3-AC1: chạy lại trên kết quả không đổi gì thêm', () => {
    for (const input of [
      'ni3',
      'ni3hao3',
      'ni3 hao3',
      'lv4',
      'ma5',
      '3',
      'xyz3',
    ]) {
      const once = convertTypedPinyin(input);
      expect(convertTypedPinyin(once)).toBe(once);
    }
  });
});
