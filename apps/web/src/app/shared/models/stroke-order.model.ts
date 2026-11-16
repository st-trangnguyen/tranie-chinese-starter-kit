import type { StrokeData } from '@csk/shared';

/** Kết quả use case thứ tự nét (S6.1): có dữ liệu nét cho đúng một chữ, hoặc không có. */
export type StrokeOrderResult =
  | { status: 'unavailable' }
  | { status: 'available'; character: string; strokeData: StrokeData };
