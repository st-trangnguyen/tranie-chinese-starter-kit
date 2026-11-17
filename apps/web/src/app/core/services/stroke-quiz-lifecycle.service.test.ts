import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_SHI } from '@test/stroke.fixtures';
import {
  countCalls,
  createStage,
  flushQuizStart,
} from '@test/stroke-quiz.helpers';
import {
  createStrokeQuiz,
  type StrokeAttemptEvent,
} from './stroke-writer.service';

// Ranh giới ngoài: thư viện chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

const SCENARIO = 'S6.2-AC1 Viết bằng chuột';

describe('createStrokeQuiz — vòng đời', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  it(`${SCENARIO}: destroy() trước khi quiz bắt đầu rồi tạo lại trên cùng host (StrictMode) chỉ để lại writer mới`, async () => {
    const { host } = createStage();
    const onFirstAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();
    const onSecondAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();

    // StrictMode: effect → cleanup → effect, tất cả trước microtask kích hoạt quiz.
    const firstQuiz = createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt: onFirstAttempt,
    });
    const firstWriter = FakeHanziWriter.last();
    firstQuiz.destroy();
    const secondQuiz = createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt: onSecondAttempt,
    });
    const secondWriter = FakeHanziWriter.last();
    await flushQuizStart();
    await flushQuizStart();

    // Writer 1 bị huỷ quiz sau khi quiz() resolve: không còn quiz hoạt động.
    const firstCalls = firstWriter.calls.map((call) => call.method);
    expect(firstCalls.lastIndexOf('cancelQuiz')).toBeGreaterThan(
      firstCalls.indexOf('quiz'),
    );
    expect(firstWriter.isQuizActive).toBe(false);
    expect(secondWriter).not.toBe(firstWriter);
    expect(secondWriter.isQuizActive).toBe(true);

    // Sự kiện của writer 1 không tới onAttempt của lần 1.
    firstWriter.emitCorrectStroke();
    firstWriter.emitMistake();
    expect(onFirstAttempt).not.toHaveBeenCalled();

    // Mỗi sự kiện của writer 2 gọi onAttempt của lần 2 đúng một lần.
    secondWriter.emitCorrectStroke();
    expect(onSecondAttempt).toHaveBeenCalledTimes(1);
    expect(onSecondAttempt).toHaveBeenLastCalledWith('correct');
    secondWriter.emitMistake();
    expect(onSecondAttempt).toHaveBeenCalledTimes(2);
    expect(onSecondAttempt).toHaveBeenLastCalledWith('mistake');

    // Host chỉ còn đúng <svg> riêng của writer 2.
    expect(host.children).toHaveLength(1);
    const onlyChild = host.firstElementChild;
    expect(onlyChild?.localName).toBe('svg');
    expect(onlyChild).toBe(secondWriter.target);

    // destroy() gọi hai lần không lỗi.
    expect(() => firstQuiz.destroy()).not.toThrow();
    expect(() => secondQuiz.destroy()).not.toThrow();
    expect(() => secondQuiz.destroy()).not.toThrow();
    expect(countCalls(secondWriter, 'cancelQuiz')).toBeGreaterThanOrEqual(1);
    expect(host.children).toHaveLength(0);
  });
});
