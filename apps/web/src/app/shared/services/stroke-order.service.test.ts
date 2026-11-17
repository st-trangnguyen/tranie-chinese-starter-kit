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

  it('S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ: "你好" không phải một chữ Hán hợp lệ', () => {
    const service = new StrokeOrderService(makeSource());

    expect(service.isSingleHanCharacter('你好')).toBe(false);
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

  it('S6.1-AC1 Chữ được yêu cầu gồm nhiều chữ: "你好" trả unavailable và không đọc file nét của 你 hay 好', async () => {
    const source = makeSource();
    const service = new StrokeOrderService(source);

    const result = await service.getStrokeOrder('你好');

    expect(result).toEqual({ status: 'unavailable' });
    expect(source.getStrokeIndex).not.toHaveBeenCalled();
    expect(source.getStrokeData).not.toHaveBeenCalled();
  });

  it('S6.1-AC1 Chữ không có dữ liệu nét: "龘" không có trong danh sách thì trả unavailable và không đọc file nét', async () => {
    const source = makeSource();
    const service = new StrokeOrderService(source);

    const result = await service.getStrokeOrder('龘');

    expect(result).toEqual({ status: 'unavailable' });
    expect(source.getStrokeData).not.toHaveBeenCalled();
  });

  it('S6.1-AC1 Chữ không có dữ liệu nét: "人" có trong danh sách thì trả available kèm dữ liệu nét của 人', async () => {
    const source = makeSource();
    const service = new StrokeOrderService(source);

    const result = await service.getStrokeOrder('人');

    expect(result).toEqual({
      status: 'available',
      character: '人',
      strokeData: STROKE_DATA,
    });
  });

  it('S6.1-AC1 Chữ không có dữ liệu nét khi offline: "龘" vẫn trả unavailable (không throw) và không đọc file nét khi mất mạng', async () => {
    const source = makeSource();
    const offlineSource: ContentSource = {
      ...source,
      getStrokeData: vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    };
    const service = new StrokeOrderService(offlineSource);

    const result = await service.getStrokeOrder('龘');

    expect(result).toEqual({ status: 'unavailable' });
    expect(offlineSource.getStrokeData).not.toHaveBeenCalled();
  });
});

const STROKE_LOAD_ERROR_MESSAGE = 'Không tải được dữ liệu nét.';

const captureRejection = async (
  promise: Promise<unknown>,
): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Mong đợi promise bị reject nhưng nó resolve');
};

const expectStrokeLoadError = (error: unknown, original: Error): void => {
  expect(error).toBeInstanceOf(Error);
  if (!(error instanceof Error)) {
    return;
  }
  expect(error.message).toBe(STROKE_LOAD_ERROR_MESSAGE);
  expect(error.cause).toBe(original);
};

describe('StrokeOrderService — lỗi tải dữ liệu nét', () => {
  it('S6.1-AC1 Tải dữ liệu nét lỗi: đọc danh sách chữ có nét thất bại thì "人" reject với lỗi "Không tải được dữ liệu nét." kèm cause là lỗi gốc', async () => {
    const original = new TypeError('Failed to fetch');
    const source: ContentSource = {
      ...makeSource(),
      getStrokeIndex: vi.fn(async () => {
        throw original;
      }),
    };
    const service = new StrokeOrderService(source);

    const error = await captureRejection(service.getStrokeOrder('人'));

    expectStrokeLoadError(error, original);
    expect(source.getStrokeData).not.toHaveBeenCalled();
  });

  it('S6.1-AC1 Tải dữ liệu nét lỗi: đọc file nét của "人" thất bại (HTTP 500) thì reject với lỗi "Không tải được dữ liệu nét." kèm cause là lỗi gốc', async () => {
    const original = new Error(
      'Không tải được nội dung: /content/strokes/%E4%BA%BA.json (HTTP 500)',
    );
    const source: ContentSource = {
      ...makeSource(),
      getStrokeData: vi.fn(async () => {
        throw original;
      }),
    };
    const service = new StrokeOrderService(source);

    const error = await captureRejection(service.getStrokeOrder('人'));

    expectStrokeLoadError(error, original);
  });

  it('S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc: file nét của "人" sai cấu trúc thì reject với lỗi "Không tải được dữ liệu nét." kèm cause là lỗi gốc', async () => {
    const original = new Error(
      'Nội dung không hợp lệ: /content/strokes/%E4%BA%BA.json',
    );
    const source: ContentSource = {
      ...makeSource(),
      getStrokeData: vi.fn(async () => {
        throw original;
      }),
    };
    const service = new StrokeOrderService(source);

    const error = await captureRejection(service.getStrokeOrder('人'));

    expectStrokeLoadError(error, original);
  });

  it('S6.1-AC1 Dữ liệu nét hỏng hoặc sai cấu trúc: file nét của "人" là JSON hỏng thì reject với lỗi "Không tải được dữ liệu nét." kèm cause là lỗi gốc', async () => {
    const original = new SyntaxError(
      'Unexpected token } in JSON at position 12',
    );
    const source: ContentSource = {
      ...makeSource(),
      getStrokeData: vi.fn(async () => {
        throw original;
      }),
    };
    const service = new StrokeOrderService(source);

    const error = await captureRejection(service.getStrokeOrder('人'));

    expectStrokeLoadError(error, original);
  });
});
