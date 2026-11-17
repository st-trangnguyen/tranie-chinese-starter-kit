import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_SHI } from '@test/stroke.fixtures';
import { createStage, flushQuizStart } from '@test/stroke-quiz.helpers';
import {
  createStrokeQuiz,
  type StrokeAttemptEvent,
} from './stroke-writer.service';

// Ranh giới ngoài: thư viện chấm nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

function startQuiz(host: SVGGElement): ReturnType<typeof createStrokeQuiz> {
  return createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
    isReducedMotion: false,
    onAttempt: vi.fn(),
  });
}

const IGNORE_SCENARIO = 'S6.2-AC1 Chạm một điểm thì bỏ qua';

describe('createStrokeQuiz — lọc nét quá ngắn', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  async function startWithSpy(): Promise<{
    writer: FakeHanziWriter;
    onAttempt: ReturnType<typeof vi.fn<(event: StrokeAttemptEvent) => void>>;
  }> {
    const { host } = createStage();
    const onAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();
    createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt,
    });
    await flushQuizStart();
    return { writer: FakeHanziWriter.last(), onAttempt };
  }

  it(`${IGNORE_SCENARIO}: nét sai dài dưới 30 đơn vị (2 điểm cách 5) là 'ignored'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitMistake({
      points: [
        { x: 500, y: 500 },
        { x: 505, y: 500 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('ignored');
  });

  it(`${IGNORE_SCENARIO}: nét sai dài đúng 30 đơn vị là 'mistake'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitMistake({
      points: [
        { x: 500, y: 500 },
        { x: 510, y: 500 },
        { x: 510, y: 520 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('mistake');
  });

  it(`${IGNORE_SCENARIO}: nét đúng dù ngắn vẫn là 'correct'`, async () => {
    const { writer, onAttempt } = await startWithSpy();

    writer.emitCorrectStroke({
      points: [
        { x: 500, y: 500 },
        { x: 505, y: 500 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('correct');
  });
});

const BACKWARDS_SCENARIO = 'S6.2-AC2 Viết ngược hướng thì sai';

describe('createStrokeQuiz — nét ngược hướng', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  it(`${BACKWARDS_SCENARIO}: quiz không nhận nét ngược (acceptBackwardsStrokes là false)`, async () => {
    const { host } = createStage();

    startQuiz(host);
    await flushQuizStart();

    expect(FakeHanziWriter.last().quizOptions?.acceptBackwardsStrokes).toBe(
      false,
    );
  });

  it(`${BACKWARDS_SCENARIO}: nét ngược đủ dài báo đúng một 'mistake'`, async () => {
    const { host } = createStage();
    const onAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();
    createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt,
    });
    await flushQuizStart();

    FakeHanziWriter.last().emitMistake({
      isBackwards: true,
      points: [
        { x: 800, y: 500 },
        { x: 200, y: 500 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('mistake');
  });
});

const OTHER_STROKE_SCENARIO = 'S6.2-AC2 Viết nét của một nét khác thì sai';

describe('createStrokeQuiz — viết nét khác', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
    document.body.innerHTML = '';
  });

  it(`${OTHER_STROKE_SCENARIO}: nét sai đủ dài, đúng hướng báo đúng một 'mistake', không 'correct'`, async () => {
    const { host } = createStage();
    const onAttempt = vi.fn<(event: StrokeAttemptEvent) => void>();
    createStrokeQuiz(host, '十', STROKE_DATA_SHI, {
      isReducedMotion: false,
      onAttempt,
    });
    await flushQuizStart();

    // Nét hiện tại của 十 là nét ngang; người viết vẽ nét dọc (nét khác), dài 600 đơn vị.
    FakeHanziWriter.last().emitMistake({
      isBackwards: false,
      points: [
        { x: 512, y: 200 },
        { x: 512, y: 800 },
      ],
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith('mistake');
    expect(onAttempt).not.toHaveBeenCalledWith('correct');
  });
});
