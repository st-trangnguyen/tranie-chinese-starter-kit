import { parseHskList } from './hskList';

const TSV = [
  '愛\t爱\tài\tlove, like',
  '地\t地\tde\tthe earth',
  '好\t好\thǎo\tgood',
].join('\n');

describe('parseHskList', () => {
  it('should keep the official order and use hanzi as id when the word is unique', () => {
    expect(parseHskList('好\n爱\n', TSV)).toEqual([
      { id: '好', hanzi: '好', pinyin: 'hǎo', en: 'good' },
      { id: '爱', hanzi: '爱', pinyin: 'ài', en: 'love, like' },
    ]);
  });

  it('should split a repeated polyphone into hanzi:pinyin ids in list order', () => {
    const entries = parseHskList('地\n好\n地', TSV);

    expect(entries.map((entry) => entry.id)).toEqual(['地:de', '好', '地:dì']);
  });

  it('should throw when a word has no pinyin in the meaning table', () => {
    expect(() => parseHskList('猫', TSV)).toThrow('猫');
  });

  it('should throw when a repeated hanzi has no declared readings', () => {
    expect(() => parseHskList('好\n好', TSV)).toThrow('POLYPHONE_READINGS');
  });
});
