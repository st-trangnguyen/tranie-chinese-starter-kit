import {
  cleanSenses,
  matchCvdict,
  matchCvdictWithErhua,
  parseCvdict,
} from './cvdict';

const CVDICT = [
  '# comment',
  '地 地 [de5] /trợ từ kết cấu/',
  '地 地 [di4] /đất/mặt đất/LT:片[pian4]/',
  '還 还 [Huan2] /họ [Huan2]/',
  '還 还 [hai2] /vẫn/còn/',
  '還 还 [huan2] /trả lại/trở về/',
  '一 一 [yi1] /một/',
  '貓 猫 [mao1] /con mèo/',
].join('\n');

const KEEP = new Set(['地', '还', '一']);
const entries = parseCvdict(CVDICT, KEEP);

describe('parseCvdict', () => {
  it('should keep only listed hanzi and convert numbered pinyin', () => {
    expect(entries.map((entry) => entry.pinyin)).toEqual([
      'de',
      'dì',
      'Huán',
      'hái',
      'huán',
      'yī',
    ]);
  });
});

describe('cleanSenses', () => {
  it('should drop classifier, surname and variant senses', () => {
    expect(
      cleanSenses([
        'đất',
        'LT:片[pian4]',
        'họ [Huan2]',
        'biến thể của 乾',
        'đất',
      ]),
    ).toEqual(['đất']);
  });
});

describe('matchCvdict', () => {
  it('should pick the entry with the same reading', () => {
    expect(
      matchCvdict({ id: '地:dì', hanzi: '地', pinyin: 'dì', en: '' }, entries),
    ).toEqual({ pinyin: 'dì', vi: ['đất', 'mặt đất'] });
  });

  it('should fall back to a toneless match when the list uses tone sandhi', () => {
    expect(
      matchCvdict({ id: '一', hanzi: '一', pinyin: 'yí', en: '' }, entries)?.vi,
    ).toEqual(['một']);
  });

  it('should return undefined when no entry exists', () => {
    expect(
      matchCvdict({ id: '猫', hanzi: '猫', pinyin: 'māo', en: '' }, entries),
    ).toBeUndefined();
  });
});

describe('matchCvdictWithErhua', () => {
  it('should look up the word without 儿 when only that form exists', () => {
    const dict = parseCvdict('好玩 好玩 [hao3 wan2] /vui/', new Set(['好玩']));

    expect(
      matchCvdictWithErhua(
        { id: '好玩儿', hanzi: '好玩儿', pinyin: 'hǎowánr', en: '' },
        dict,
      ),
    ).toEqual({ pinyin: 'hǎo wán', vi: ['vui'] });
  });
});
