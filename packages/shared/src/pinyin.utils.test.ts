import { describe, expect, it } from 'vitest';

import {
  isToneMarkedPinyin,
  numberedToToneMarks,
  pinyinKey,
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
