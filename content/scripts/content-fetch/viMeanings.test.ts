import { parse } from 'yaml';

import { mergeViMeanings } from './viMeanings';

const WORDS = [
  { id: '爱', hanzi: '爱', pinyin: 'ài', en: 'love' },
  { id: '好', hanzi: '好', pinyin: 'hǎo', en: 'good' },
];
const MATCHES = new Map([
  ['爱', { pinyin: 'ài', vi: ['yêu', 'thích'] }],
  ['好', undefined],
]);

describe('mergeViMeanings', () => {
  it('should seed every word with CVDICT meanings and reviewed false when the file is empty', () => {
    const yaml = mergeViMeanings('', WORDS, MATCHES);

    expect(parse(yaml)).toEqual({
      爱: { vi: ['yêu', 'thích'], reviewed: false },
      好: { vi: [], reviewed: false },
    });
  });

  it('should keep reviewed rows and comments untouched when merging', () => {
    const existing = '# ghi chú\n爱: { vi: [thương], reviewed: true }\n';

    const yaml = mergeViMeanings(existing, WORDS, MATCHES);

    expect(yaml).toContain('# ghi chú');
    expect(parse(yaml)).toEqual({
      爱: { vi: ['thương'], reviewed: true },
      好: { vi: [], reviewed: false },
    });
  });
});
