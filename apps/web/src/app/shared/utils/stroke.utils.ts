/** Hộp toạ độ của dữ liệu nét (Make Me a Hanzi / hanzi-writer): 1024 × 1024. */
export const STROKE_VIEWBOX = '0 0 1024 1024';

/** Đổi toạ độ dữ liệu nét (gốc dưới, trục y hướng lên) sang toạ độ SVG (gốc trên, y hướng xuống). */
export const STROKE_PATH_TRANSFORM = 'translate(0, 900) scale(1, -1)';

/** Baseline của dữ liệu nét: `STROKE_PATH_TRANSFORM` lật trục y quanh y = 900. */
const STROKE_BASELINE_Y = 900;

/** Điểm đặt số thứ tự nét: điểm đầu median, đổi sang toạ độ SVG (ngoài nhóm transform). */
export function strokeLabelPoint(median: number[][]): { x: number; y: number } {
  const [x = 0, y = 0] = median[0] ?? [];
  return { x, y: STROKE_BASELINE_Y - y };
}
