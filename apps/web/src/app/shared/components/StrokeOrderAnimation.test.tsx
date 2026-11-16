import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen } from '@test/render';
import { FakeHanziWriter } from '@test/mocks/hanzi-writer';
import { STROKE_DATA_HAO } from '@test/stroke.fixtures';

import { StrokeOrderAnimation } from './StrokeOrderAnimation';

// Ranh giới ngoài: thư viện vẽ nét hanzi-writer được thay bằng bản giả điều khiển được.
vi.mock('hanzi-writer', async () => {
  const mock = await import('@test/mocks/hanzi-writer');
  return { default: mock.FakeHanziWriter };
});

describe('StrokeOrderAnimation', () => {
  beforeEach(() => {
    FakeHanziWriter.reset();
  });

  afterEach(() => {
    FakeHanziWriter.reset();
  });

  it('S6.1-AC1: Chữ hiện animation và tự phát khi mở', async () => {
    renderWithProviders(
      <StrokeOrderAnimation character="好" strokeData={STROKE_DATA_HAO} />,
    );

    const figure = screen.getByRole('img', { name: 'Thứ tự nét chữ 好' });
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');

    // Tự phát: không bấm gì, nét đầu tiên (chỉ số 0) đã được yêu cầu vẽ.
    await vi.waitFor(() => {
      expect(FakeHanziWriter.last().requestedStrokes).toEqual([0]);
    });
    const writer = FakeHanziWriter.last();
    expect(writer.character).toBe('好');
    expect(writer.pendingStrokes).toEqual([0]);
    expect(figure).toHaveAttribute('data-drawn-stroke-count', '0');
  });
});
