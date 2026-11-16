import { hanCharacterSchema } from '@csk/shared';

import {
  contentSource,
  type ContentSource,
} from '@core/services/content-source.service';
import type { StrokeOrderResult } from '@shared/models/stroke-order.model';

export class StrokeOrderService {
  constructor(private readonly source: ContentSource = contentSource) {}

  // ── PHẦN 1 — TRUY CẬP DỮ LIỆU ─────────────────────────
  // Đọc danh sách chữ và dữ liệu nét qua `this.source`.

  // ── PHẦN 2 — QUY TẮC NGHIỆP VỤ ───────────────────────

  // Rule: chữ được yêu cầu hợp lệ khi gồm đúng một ký tự Hán;
  // rỗng, chữ Latin, nhiều chữ đều không hợp lệ.
  isSingleHanCharacter(input: string): boolean {
    return hanCharacterSchema.safeParse(input).success;
  }

  // ── PHẦN 3 — USE CASES ───────────────────────────────

  async getStrokeOrder(input: string): Promise<StrokeOrderResult> {
    if (!this.isSingleHanCharacter(input)) {
      return { status: 'unavailable' };
    }
    throw new Error('Không tải được dữ liệu nét.');
  }
}
