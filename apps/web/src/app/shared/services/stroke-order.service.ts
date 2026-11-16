import {
  hanCharacterSchema,
  type StrokeData,
  type StrokeIndex,
} from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { StrokeOrderResult } from '@shared/models/stroke-order.model';

export class StrokeOrderService {
  constructor(private readonly source: ContentSource = contentSource) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
  // Đọc danh sách chữ và dữ liệu nét qua `this.source`.

  private readStrokeIndex(): Promise<StrokeIndex> {
    return this.source.getStrokeIndex();
  }

  private readStrokeData(character: string): Promise<StrokeData> {
    return this.source.getStrokeData(character);
  }

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: chữ được yêu cầu hợp lệ khi gồm đúng một ký tự Hán;
  // rỗng, chữ Latin, nhiều chữ đều không hợp lệ.
  isSingleHanCharacter(input: string): boolean {
    return hanCharacterSchema.safeParse(input).success;
  }

  // Rule: chỉ chữ có trong danh sách nét của bản app mới có dữ liệu nét.
  hasStrokeData(character: string, index: StrokeIndex): boolean {
    return index.includes(character);
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async getStrokeOrder(input: string): Promise<StrokeOrderResult> {
    if (!this.isSingleHanCharacter(input)) {
      return { status: 'unavailable' };
    }
    const index = await this.readStrokeIndex();
    if (!this.hasStrokeData(input, index)) {
      return { status: 'unavailable' };
    }
    const strokeData = await this.readStrokeData(input);
    return { status: 'available', character: input, strokeData };
  }
}
