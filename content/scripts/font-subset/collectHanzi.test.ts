import { collectHanzi } from './collectHanzi';

const sortedByCodePoint = (text: string): string => [...text].sort().join('');

describe('collectHanzi', () => {
  it('should return an empty string when there is no content yet', () => {
    expect(collectHanzi([])).toBe('');
  });

  it('should collect unique hanzi from nested values when sorted by code point', () => {
    const content = [{ a: '你好', b: [{ c: '好学' }] }, '中文 nǐ'];

    expect(collectHanzi(content)).toBe(sortedByCodePoint('中你好学文'));
  });

  it('should ignore hanzi when they only appear in object keys', () => {
    expect(collectHanzi([{ 汉: 'x' }])).toBe('');
  });

  it('should ignore non-strings and Chinese punctuation', () => {
    expect(collectHanzi([42, null, true, '。，'])).toBe('');
  });
});
