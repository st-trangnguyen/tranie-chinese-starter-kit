import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_BAI } from '@test/stroke.fixtures';

import { StrokeOrderStatic } from './StrokeOrderStatic';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả để kiểm nó không được dùng.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

/** Path nét đậm của khối tĩnh (design D9/D10: `StrokeGlyph` variant `solid`, class `stroke-order-stroke`). */
const getSolidPaths = (figure: HTMLElement): SVGPathElement[] => [
  ...new Set(
    figure.querySelectorAll<SVGPathElement>(
      '.stroke-order-stroke path, path.stroke-order-stroke',
    ),
  ),
];

/** Điểm đầu median trong toạ độ SVG: dữ liệu nét lật trục y quanh baseline 900 (`STROKE_PATH_TRANSFORM`). */
const expectedLabelPoints = STROKE_DATA_BAI.medians.map((median) => {
  const [x, y] = median[0] ?? [];
  return { x, y: y === undefined ? undefined : 900 - y };
});

describe('StrokeOrderStatic', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC1: Giảm chuyển động hiện thứ tự nét tĩnh', () => {
    renderWithProviders(
      <StrokeOrderStatic character="白" strokeData={STROKE_DATA_BAI} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 白' });
    expect(figure.tagName).toBe('FIGURE');

    // Ngay lập tức (không chờ, không bấm): đủ 5 nét đậm, đúng thứ tự viết.
    const solidPaths = getSolidPaths(figure);
    expect(STROKE_DATA_BAI.strokes).toHaveLength(5);
    expect(solidPaths).toHaveLength(5);
    expect(solidPaths.map((path) => path.getAttribute('d'))).toEqual(
      STROKE_DATA_BAI.strokes,
    );

    // Mỗi nét có số thứ tự 1…5, đặt ở điểm đầu median của chính nét đó.
    const labels = [...figure.querySelectorAll('text')];
    expect(labels.map((label) => label.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(
      labels.map((label) => ({
        x: Number(label.getAttribute('x')),
        y: Number(label.getAttribute('y')),
      })),
    ).toEqual(expectedLabelPoints);

    // Không có animation: không tạo writer, không có nút "Phát lại".
    expect(FakeHanziWriter.instances).toEqual([]);
    expect(
      screen.queryByRole('button', { name: 'Phát lại' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
