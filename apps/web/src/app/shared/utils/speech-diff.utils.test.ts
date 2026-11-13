import { describe, expect, it } from 'vitest';

import {
  diffSpeech,
  isSpeechMatch,
  normalizeSpeechText,
} from './speech-diff.utils';

describe('speech-diff.utils', () => {
  it('S5.3-AC2: chuẩn hoá bỏ khoảng trắng và dấu câu, giữ nguyên chữ', () => {
    expect(normalizeSpeechText(' 你好， ')).toBe('你好');
  });

  it('S5.3-AC2: nhận đúng hết thì mọi segment là same và khớp', () => {
    const segments = diffSpeech('你好', '你好');

    expect(segments).toEqual([
      { kind: 'same', char: '你' },
      { kind: 'same', char: '好' },
    ]);
    expect(segments.some((segment) => segment.kind !== 'same')).toBe(false);
    expect(isSpeechMatch(segments)).toBe(true);
  });

  it('S5.3-AC2: nhận một chữ khác thì chữ đó là different (chữ máy nghe được), chữ còn lại là same', () => {
    const segments = diffSpeech('你好', '你号');

    expect(segments).toEqual([
      { kind: 'same', char: '你' },
      { kind: 'different', char: '号' },
    ]);
    expect(isSpeechMatch(segments)).toBe(false);
  });

  it('S5.3-AC2: khác dấu câu và khoảng trắng vẫn tính là khớp', () => {
    expect(isSpeechMatch(diffSpeech('你好！', '你 好'))).toBe(true);
  });

  it('S5.3-AC2: chuẩn hoá "你好！" và "你 好" cùng ra "你好"', () => {
    expect(normalizeSpeechText('你好！')).toBe('你好');
    expect(normalizeSpeechText('你 好')).toBe('你好');
  });

  it('S5.3-AC2: câu đúng "你好！", máy nhận "你 好" thì không có segment lệch', () => {
    const segments = diffSpeech('你好！', '你 好');

    expect(segments).toEqual([
      { kind: 'same', char: '你' },
      { kind: 'same', char: '好' },
    ]);
    expect(segments.some((segment) => segment.kind !== 'same')).toBe(false);
  });

  it('S5.3-AC2: câu đúng "你好", máy nhận "你 好" thì không có segment lệch', () => {
    const segments = diffSpeech('你好', '你 好');

    expect(segments.some((segment) => segment.kind !== 'same')).toBe(false);
    expect(isSpeechMatch(segments)).toBe(true);
  });

  it('S5.3-AC2: máy nhận thiếu chữ thì chữ đó là missing, lấy chữ của câu đúng', () => {
    const segments = diffSpeech('你好吗', '你好');

    expect(segments).toEqual([
      { kind: 'same', char: '你' },
      { kind: 'same', char: '好' },
      { kind: 'missing', char: '吗' },
    ]);
    expect(isSpeechMatch(segments)).toBe(false);
  });

  it('S5.3-AC2: máy nhận thừa chữ thì chữ đó là extra, lấy chữ máy nghe được', () => {
    const segments = diffSpeech('你好', '你好吗');

    expect(segments).toEqual([
      { kind: 'same', char: '你' },
      { kind: 'same', char: '好' },
      { kind: 'extra', char: '吗' },
    ]);
    expect(isSpeechMatch(segments)).toBe(false);
  });
});
