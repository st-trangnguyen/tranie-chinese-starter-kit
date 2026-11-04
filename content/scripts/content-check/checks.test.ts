import { audioJob } from '../content-build/audio';
import {
  audioCheck,
  HSK1_WORD_COUNT,
  hskWordsCheck,
  outputInSyncCheck,
  strokesCheck,
  viMeaningsCheck,
} from './checks';

const entry = (id: string, pinyin = 'hǎo') => ({
  id,
  hanzi: id,
  pinyin,
  en: '',
});
const fullList = Array.from({ length: HSK1_WORD_COUNT }, (_, i) =>
  entry(`w${i}`),
);

describe('hskWordsCheck', () => {
  it('should pass when the list has 500 words with marked pinyin', async () => {
    expect(await hskWordsCheck('f', fullList).run()).toEqual([]);
  });

  it('should report an error when the count is wrong', async () => {
    const issues = await hskWordsCheck('f', fullList.slice(1)).run();

    expect(issues).toEqual([
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('499'),
      }),
    ]);
  });

  it('should report each word without marked pinyin', async () => {
    const list = [...fullList.slice(2), entry('好', 'hao3'), entry('人', '')];

    const issues = await hskWordsCheck('f', list).run();

    expect(issues.map((issue) => issue.message)).toEqual([
      expect.stringContaining('"好"'),
      expect.stringContaining('"人"'),
    ]);
  });
});

describe('viMeaningsCheck', () => {
  it('should warn with the list of words lacking a meaning or a review', async () => {
    const issues = await viMeaningsCheck(
      'vi.yaml',
      [entry('爱'), entry('好'), entry('人')],
      {
        爱: { vi: ['yêu'], reviewed: true },
        好: { vi: ['tốt'], reviewed: false },
      },
    ).run();

    expect(issues).toEqual([
      expect.objectContaining({
        level: 'warning',
        message: '1 từ chưa có nghĩa tiếng Việt: 人',
      }),
      expect.objectContaining({
        level: 'warning',
        message: '2 từ chưa review nghĩa: 好, 人',
      }),
    ]);
  });
});

describe('audioCheck', () => {
  it('should report missing mp3 files as an error', async () => {
    const jobs = [audioJob('你好', 'female'), audioJob('谢谢', 'female')];
    const have = new Set([jobs[0]?.path]);

    const issues = await audioCheck('audio', jobs, (path) =>
      have.has(path),
    ).run();

    expect(issues).toEqual([
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('谢谢'),
      }),
    ]);
  });
});

describe('strokesCheck', () => {
  it('should warn about characters without stroke data', async () => {
    const issues = await strokesCheck('lessons', ['〇']).run();

    expect(issues[0]?.level).toBe('warning');
  });
});

describe('outputInSyncCheck', () => {
  it('should fail when generated files are stale or extra', async () => {
    const issues = await outputInSyncCheck('content', {
      stale: ['words.json'],
      extra: ['lessons/old.json'],
    }).run();

    expect(issues[0]?.message).toContain('words.json, lessons/old.json');
  });
});
