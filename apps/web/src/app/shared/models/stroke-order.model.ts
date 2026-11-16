import type { StrokeData } from '@csk/shared';

/** Kết quả use case thứ tự nét (S6.1): có dữ liệu nét cho đúng một chữ, hoặc không có. */
export type StrokeOrderResult =
  | { status: 'unavailable' }
  | { status: 'available'; character: string; strokeData: StrokeData };

/** Trạng thái màn thứ tự nét (S6.1) mà hook trả cho container. */
export type StrokeOrderView =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'unavailable' }
  | { status: 'ready'; character: string; strokeData: StrokeData };
