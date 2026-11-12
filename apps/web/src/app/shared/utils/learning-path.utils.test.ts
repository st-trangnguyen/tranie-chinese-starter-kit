import type { Lesson } from '@csk/shared';
import { describe, expect, it } from 'vitest';

import {
  findConfirmedPlacementTestLessonId,
  findPlacementTestLessonId,
} from './learning-path.utils';

type LessonType = Lesson['type'];

const toTypes = (
  entries: ReadonlyArray<readonly [string, LessonType]>,
): Map<string, LessonType> => new Map(entries);

describe('findPlacementTestLessonId', () => {
  it('S3.6-AC1: chọn bài test CUỐI khi chủ đề có nhiều bài test', () => {
    const types = toTypes([
      ['a', 'lesson'],
      ['b', 'test'],
      ['c', 'lesson'],
      ['d', 'test'],
      ['e', 'lesson'],
    ]);
    expect(findPlacementTestLessonId(['a', 'b', 'c', 'd', 'e'], types)).toBe(
      'd',
    );
  });

  it('S3.6-AC1: không có bài test thì trả undefined', () => {
    const types = toTypes([
      ['a', 'lesson'],
      ['b', 'lesson'],
    ]);
    expect(findPlacementTestLessonId(['a', 'b'], types)).toBeUndefined();
    expect(findPlacementTestLessonId([], types)).toBeUndefined();
  });

  it('S3.6-AC1: map thiếu loại của một bài thì vẫn trả bài test cuối đã biết', () => {
    const types = toTypes([
      ['a', 'test'],
      ['b', 'lesson'],
      ['d', 'lesson'],
    ]);
    // 'c' chưa biết loại (nạp lỗi): vẫn trả bài test cuối trong số bài đã biết.
    expect(findPlacementTestLessonId(['a', 'b', 'c', 'd'], types)).toBe('a');
  });
});

describe('findConfirmedPlacementTestLessonId', () => {
  it('S3.6-AC2: map thiếu loại của một bài thì trả undefined', () => {
    const types = toTypes([
      ['a', 'lesson'],
      ['b', 'test'],
    ]);
    expect(
      findConfirmedPlacementTestLessonId(['a', 'b', 'c'], types),
    ).toBeUndefined();
  });

  it('S3.6-AC2: mọi bài đủ loại thì hai hàm trả cùng kết quả', () => {
    const types = toTypes([
      ['a', 'lesson'],
      ['b', 'test'],
      ['c', 'lesson'],
      ['d', 'test'],
    ]);
    const ids = ['a', 'b', 'c', 'd'];
    expect(findConfirmedPlacementTestLessonId(ids, types)).toBe('d');
    expect(findConfirmedPlacementTestLessonId(ids, types)).toBe(
      findPlacementTestLessonId(ids, types),
    );
  });

  it('S3.6-AC2: mọi bài đủ loại nhưng không có bài test thì cả hai trả undefined', () => {
    const types = toTypes([
      ['a', 'lesson'],
      ['b', 'lesson'],
    ]);
    expect(
      findConfirmedPlacementTestLessonId(['a', 'b'], types),
    ).toBeUndefined();
    expect(findPlacementTestLessonId(['a', 'b'], types)).toBeUndefined();
  });
});
