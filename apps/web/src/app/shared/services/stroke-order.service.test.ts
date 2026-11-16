import type { StrokeData, StrokeIndex } from '@csk/shared';

import type { ContentSource } from '@core/services/content-source.service';
import { StrokeOrderService } from './stroke-order.service';

const STROKE_INDEX: StrokeIndex = ['人'];
const STROKE_DATA: StrokeData = {
  strokes: ['M 0 0 L 1 1'],
  medians: [
    [
      [0, 0],
      [1, 1],
    ],
  ],
};

const makeSource = (): ContentSource => ({
  getContentRoot: vi.fn(async () => {
    throw new Error('không dùng trong test này');
  }),
  getLesson: vi.fn(async () => {
    throw new Error('không dùng trong test này');
  }),
  getWords: vi.fn(async () => []),
  getSentences: vi.fn(async () => []),
  getStrokeIndex: vi.fn(async () => STROKE_INDEX),
  getStrokeData: vi.fn(async () => STROKE_DATA),
});

describe('StrokeOrderService — quy tắc nghiệp vụ', () => {
  it('S6.1-AC1 Chữ được yêu cầu rỗng: chuỗi rỗng không phải một chữ Hán hợp lệ', () => {
    const service = new StrokeOrderService(makeSource());

    expect(service.isSingleHanCharacter('')).toBe(false);
  });

  it('S6.1-AC1 Chữ được yêu cầu không phải chữ Hán: "abc" không phải một chữ Hán hợp lệ', () => {
    const service = new StrokeOrderService(makeSource());

    expect(service.isSingleHanCharacter('abc')).toBe(false);
  });
});

describe('StrokeOrderService — use cases', () => {
  it('S6.1-AC1 Chữ được yêu cầu rỗng: trả unavailable và không đọc nguồn dữ liệu nét', async () => {
    const source = makeSource();
    const service = new StrokeOrderService(source);

    const result = await service.getStrokeOrder('');

    expect(result).toEqual({ status: 'unavailable' });
    expect(source.getStrokeIndex).not.toHaveBeenCalled();
    expect(source.getStrokeData).not.toHaveBeenCalled();
  });

  it('S6.1-AC1 Chữ được yêu cầu không phải chữ Hán: "abc" trả unavailable và không đọc nguồn dữ liệu nét', async () => {
    const source = makeSource();
    const service = new StrokeOrderService(source);

    const result = await service.getStrokeOrder('abc');

    expect(result).toEqual({ status: 'unavailable' });
    expect(source.getStrokeIndex).not.toHaveBeenCalled();
    expect(source.getStrokeData).not.toHaveBeenCalled();
  });
});
