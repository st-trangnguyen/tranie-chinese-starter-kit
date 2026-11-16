import { describe, expect, it } from 'vitest';

import { STROKE_DATA_BAI } from '@test/stroke.fixtures';

import { strokeLabelPoint } from './stroke.utils';

/**
 * Dữ liệu nét có gốc ở baseline 900, trục y hướng lên; `STROKE_PATH_TRANSFORM`
 * (`translate(0, 900) scale(1, -1)`) đổi sang toạ độ SVG: x giữ nguyên, y = 900 - y.
 * Số thứ tự nét nằm ngoài nhóm transform (design D9), nên điểm trả về phải là toạ độ đã đổi.
 */
describe('strokeLabelPoint', () => {
  it('S6.1-AC1: Giảm chuyển động hiện thứ tự nét tĩnh — trả điểm đầu median, đổi sang toạ độ màn', () => {
    expect(
      strokeLabelPoint([
        [449, 809],
        [312, 536],
      ]),
    ).toEqual({ x: 449, y: 91 });
    expect(
      strokeLabelPoint([
        [311, 150],
        [655, 161],
      ]),
    ).toEqual({ x: 311, y: 750 });
  });

  it('S6.1-AC1: Giảm chuyển động hiện thứ tự nét tĩnh — mỗi nét của 白 lấy điểm đầu median của chính nét đó', () => {
    const points = STROKE_DATA_BAI.medians.map((median) =>
      strokeLabelPoint(median),
    );

    expect(points).toEqual([
      { x: 449, y: 91 },
      { x: 184, y: 366 },
      { x: 235, y: 372 },
      { x: 287, y: 565 },
      { x: 311, y: 750 },
    ]);
  });

  it('S6.1-AC1: Giảm chuyển động hiện thứ tự nét tĩnh — không đổi median đầu vào', () => {
    const median = [
      [449, 809],
      [312, 536],
    ];
    const snapshot = structuredClone(median);

    strokeLabelPoint(median);

    expect(median).toEqual(snapshot);
  });
});
