import { STROKE_DATA_SHI } from '@test/stroke.fixtures';
import { WritingPracticeService } from './writing-practice.service';

describe('WritingPracticeService — quy tắc nghiệp vụ', () => {
  it('S6.2-AC1 Viết đúng nét thì sang nét kế: viết đúng nét đầu của 十 thì giữ nét đó và chờ nét kế tiếp', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const snapshot = structuredClone(initial);

    const next = service.recordStrokeAttempt(initial, 'correct');

    expect(next.completedStrokeCount).toBe(1);
    expect(next.isComplete).toBe(false);
    expect(next.lastAttempt).toBe('correct');
    expect(initial).toEqual(snapshot);
  });

  it('S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ: viết đúng cả 2 nét của 十 thì xong chữ', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);

    const afterFirst = service.recordStrokeAttempt(initial, 'correct');
    const afterSecond = service.recordStrokeAttempt(afterFirst, 'correct');

    expect(afterFirst.isComplete).toBe(false);
    expect(afterSecond.completedStrokeCount).toBe(2);
    expect(afterSecond.isComplete).toBe(true);
  });

  it('S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ: chữ 7 nét chỉ xong sau nét đúng thứ 7, không xong sớm (TC-S6.2-AC1-12)', () => {
    const service = new WritingPracticeService();
    let state = service.startPractice(7);
    const completions: boolean[] = [];

    for (let stroke = 0; stroke < 7; stroke += 1) {
      state = service.recordStrokeAttempt(state, 'correct');
      completions.push(state.isComplete);
    }

    expect(completions).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(state.completedStrokeCount).toBe(7);
  });

  it.each(['correct', 'mistake', 'ignored'] as const)(
    'S6.2-AC1 Viết đúng hết các nét thì hoàn thành chữ: sau khi xong 十, sự kiện %s bị bỏ qua và trả nguyên state (TC-S6.2-AC1-13)',
    (result) => {
      const service = new WritingPracticeService();
      const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
      const complete = service.recordStrokeAttempt(
        service.recordStrokeAttempt(initial, 'correct'),
        'correct',
      );

      const next = service.recordStrokeAttempt(complete, result);

      expect(complete.isComplete).toBe(true);
      expect(next).toBe(complete);
    },
  );

  it('S6.2-AC3 Sai dưới 3 lần thì chưa gợi ý: sai cùng một nét của 十 2 lần liên tiếp thì đếm 2 lần sai và chưa hiện gợi ý', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);

    const afterFirst = service.recordStrokeAttempt(initial, 'mistake');
    const { mistakeCount, isHintVisible, completedStrokeCount } =
      service.recordStrokeAttempt(afterFirst, 'mistake');

    expect(mistakeCount).toBe(2);
    expect(isHintVisible).toBe(false);
    expect(completedStrokeCount).toBe(0);
  });

  it('S6.2-AC3 Sai 3 lần liên tiếp thì hiện gợi ý: sai cùng một nét của 十 3 lần liên tiếp thì hiện gợi ý cho nét hiện tại', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);

    const afterFirst = service.recordStrokeAttempt(initial, 'mistake');
    const afterSecond = service.recordStrokeAttempt(afterFirst, 'mistake');
    const afterThird = service.recordStrokeAttempt(afterSecond, 'mistake');

    expect(afterFirst.isHintVisible).toBe(false);
    expect(afterSecond.isHintVisible).toBe(false);
    expect(afterThird.isHintVisible).toBe(true);
    expect(afterThird.completedStrokeCount).toBe(0);
  });

  it('S6.2-AC3 Bộ đếm sai tính riêng từng nét: sai nét đầu của 十 2 lần, viết đúng, rồi sai nét thứ hai thì chỉ hiện gợi ý ở lần sai thứ 3 của nét thứ hai', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const attempts = [
      'mistake',
      'mistake',
      'correct',
      'mistake',
      'mistake',
    ] as const;

    const afterFifth = attempts.reduce(
      (state, result) => service.recordStrokeAttempt(state, result),
      initial,
    );
    const afterSixth = service.recordStrokeAttempt(afterFifth, 'mistake');

    expect(afterFifth.isHintVisible).toBe(false);
    expect(afterFifth.mistakeCount).toBe(2);
    expect(afterFifth.completedStrokeCount).toBe(1);
    expect(afterSixth.isHintVisible).toBe(true);
    expect(afterSixth.completedStrokeCount).toBe(1);
    expect(afterSixth.isComplete).toBe(false);
  });

  it('S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai: sai nét đầu của 十 2 lần, chạm một điểm, rồi sai tiếp thì hiện gợi ý ở lần sai thứ 3', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const attempts = ['mistake', 'mistake', 'ignored'] as const;

    const afterIgnored = attempts.reduce(
      (state, result) => service.recordStrokeAttempt(state, result),
      initial,
    );
    const afterThirdMistake = service.recordStrokeAttempt(
      afterIgnored,
      'mistake',
    );

    expect(afterIgnored.mistakeCount).toBe(2);
    expect(afterIgnored.isHintVisible).toBe(false);
    expect(afterThirdMistake.mistakeCount).toBe(3);
    expect(afterThirdMistake.isHintVisible).toBe(true);
    expect(afterThirdMistake.completedStrokeCount).toBe(0);
  });

  it('S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai: sai 1 lần, chạm một điểm 3 lần, rồi sai 1 lần nữa thì chưa hiện gợi ý (TC-S6.2-AC3-7)', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const attempts = [
      'mistake',
      'ignored',
      'ignored',
      'ignored',
      'mistake',
    ] as const;

    const next = attempts.reduce(
      (state, result) => service.recordStrokeAttempt(state, result),
      initial,
    );

    expect(next.mistakeCount).toBe(2);
    expect(next.isHintVisible).toBe(false);
    expect(next.completedStrokeCount).toBe(0);
  });

  it('S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai: chạm một điểm trả nguyên state', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const afterMistake = service.recordStrokeAttempt(initial, 'mistake');

    expect(service.recordStrokeAttempt(initial, 'ignored')).toBe(initial);
    expect(service.recordStrokeAttempt(afterMistake, 'ignored')).toBe(
      afterMistake,
    );
  });

  it('S6.2-AC3 Chạm một điểm không tính vào bộ đếm sai: chạm một điểm sau nét sai giữ nguyên thông báo sai đang có', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const afterMistake = service.recordStrokeAttempt(initial, 'mistake');

    const afterIgnored = service.recordStrokeAttempt(afterMistake, 'ignored');

    expect(afterIgnored.lastAttempt).toBe('mistake');
    expect(afterIgnored.mistakeSerial).toBe(afterMistake.mistakeSerial);
    expect(afterIgnored.mistakeCount).toBe(1);
  });

  it.each([4, 6])(
    'S6.2-AC3 Gợi ý vẫn hiện nếu tiếp tục sai: sai cùng một nét của 十 %i lần liên tiếp thì gợi ý vẫn hiện',
    (mistakes) => {
      const service = new WritingPracticeService();
      const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);

      const next = Array.from({ length: mistakes }).reduce<
        ReturnType<WritingPracticeService['startPractice']>
      >((state) => service.recordStrokeAttempt(state, 'mistake'), initial);

      expect(next.isHintVisible).toBe(true);
      expect(next.completedStrokeCount).toBe(0);
      expect(next.isComplete).toBe(false);
    },
  );

  it('S6.2-AC3 Viết đúng thì gợi ý ẩn: gợi ý đang hiện ở nét đầu của 十, viết đúng nét đó thì ẩn gợi ý, giữ nét và chờ nét kế', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(STROKE_DATA_SHI.strokes.length);
    const attempts = ['mistake', 'mistake', 'mistake'] as const;

    const withHint = attempts.reduce(
      (state, result) => service.recordStrokeAttempt(state, result),
      initial,
    );
    const next = service.recordStrokeAttempt(withHint, 'correct');

    expect(withHint.isHintVisible).toBe(true);
    expect(next.isHintVisible).toBe(false);
    expect(next.completedStrokeCount).toBe(1);
    expect(next.mistakeCount).toBe(0);
    expect(next.isComplete).toBe(false);
  });
});

describe('WritingPracticeService — kết quả câu viết trong bài (S7.1)', () => {
  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: viết sai nét chưa cho kết quả', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(2);

    const afterMistake = service.recordStrokeAttempt(initial, 'mistake');

    expect(service.lessonResultOf(initial, afterMistake)).toBeNull();
  });

  it('S7.1-AC1 Viết xong chữ thì câu được tính đúng: viết đúng nét cuối thì câu Đúng, không có giải thích', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(2);

    const afterFirst = service.recordStrokeAttempt(initial, 'correct');
    const afterSecond = service.recordStrokeAttempt(afterFirst, 'correct');

    expect(service.lessonResultOf(initial, afterFirst)).toBeNull();
    const result = service.lessonResultOf(afterFirst, afterSecond);
    expect(result).toEqual({ isCorrect: true });
    expect(result).not.toHaveProperty('explanation');
  });

  it.each(['correct', 'mistake', 'ignored'] as const)(
    'S7.1-AC1 Viết xong chữ thì câu được tính đúng: sự kiện %s sau khi đã xong chữ không cho kết quả lần nữa',
    (attempt) => {
      const service = new WritingPracticeService();
      const complete = service.recordStrokeAttempt(
        service.recordStrokeAttempt(service.startPractice(2), 'correct'),
        'correct',
      );

      const next = service.recordStrokeAttempt(complete, attempt);

      expect(service.lessonResultOf(complete, next)).toBeNull();
    },
  );

  it('S7.1-AC1 Câu viết chỉ có kết quả Đúng: viết sai nét nhiều lần không bao giờ cho kết quả Sai', () => {
    const service = new WritingPracticeService();
    const attempts = [
      'mistake',
      'mistake',
      'mistake',
      'mistake',
      'correct',
      'correct',
    ] as const;

    let state = service.startPractice(2);
    const results = attempts.map((attempt) => {
      const next = service.recordStrokeAttempt(state, attempt);
      const result = service.lessonResultOf(state, next);
      state = next;
      return result;
    });

    expect(results.slice(0, -1)).toEqual([null, null, null, null, null]);
    expect(results).not.toContainEqual(
      expect.objectContaining({ isCorrect: false }),
    );
    expect(results.at(-1)).toEqual({ isCorrect: true });
  });
});

describe('WritingPracticeService — lượt viết vừa xong chữ (S9.1)', () => {
  const completeOf = (service: WritingPracticeService) =>
    service.recordStrokeAttempt(
      service.recordStrokeAttempt(service.startPractice(2), 'correct'),
      'correct',
    );

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: chưa xong → xong là vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const afterFirst = service.recordStrokeAttempt(
      service.startPractice(2),
      'correct',
    );
    const complete = service.recordStrokeAttempt(afterFirst, 'correct');

    expect(service.hasJustCompleted(afterFirst, complete)).toBe(true);
  });

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: đã xong → vẫn xong không phải vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const complete = completeOf(service);
    const next = service.recordStrokeAttempt(complete, 'correct');

    expect(service.hasJustCompleted(complete, next)).toBe(false);
  });

  it('S9.1-AC2 Viết xong chữ của từ đã học thì tạo thẻ chiều viết: chưa xong → chưa xong không phải vừa xong chữ', () => {
    const service = new WritingPracticeService();
    const initial = service.startPractice(2);
    const afterFirst = service.recordStrokeAttempt(initial, 'correct');

    expect(service.hasJustCompleted(initial, afterFirst)).toBe(false);
  });
});
