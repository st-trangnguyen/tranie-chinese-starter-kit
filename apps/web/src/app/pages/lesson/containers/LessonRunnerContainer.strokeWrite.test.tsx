import { describe, expect, it, vi } from 'vitest';

import {
  PERSON,
  answerToneChoiceAndContinue,
  findLessonPad,
  outlinePathsOf,
  renderLessonRunner,
  setupLessonStrokeWrite,
} from '@test/lesson-stroke-write.helpers';
import { screen } from '@test/render';

// Ranh giới ngoài: thư viện vẽ/chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

setupLessonStrokeWrite();

const MAX_TABS = 20;

describe('LessonRunnerContainer — câu viết', () => {
  it('S7.1-AC1 Câu viết hiện khung viết của đúng chữ: should show the empty writing pad of 人 with its 2-stroke outline, without the unsupported-kind fallback, when reaching the stroke-write exercise', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Câu 2 / 3');
    expect(screen.queryByText('Dạng bài này chưa có.')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Bỏ qua câu này' }),
    ).not.toBeInTheDocument();

    const pad = await findLessonPad(PERSON);
    expect(outlinePathsOf(pad)).toHaveLength(2);
    expect(pad).toHaveAttribute('data-completed-stroke-count', '0');
  });

  it('S7.1-AC1 Khung viết trong bài nhận focus bàn phím: should move keyboard focus onto the writing pad figure of 人, whose accessible name contains 人, when tabbing on the stroke-write exercise', async () => {
    const { user } = renderLessonRunner();
    await answerToneChoiceAndContinue(user);
    const pad = await findLessonPad(PERSON);

    // Tab tới khung viết (giới hạn số lần để không lặp vô hạn).
    for (
      let press = 0;
      press < MAX_TABS && document.activeElement !== pad;
      press += 1
    ) {
      await user.tab();
    }

    expect(document.activeElement).toBe(pad);
    expect(pad).toHaveAccessibleName(expect.stringContaining(PERSON));
  });
});
