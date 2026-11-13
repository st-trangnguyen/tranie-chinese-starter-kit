import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '@core/helpers/db.helper';
import { renderWithProviders, screen } from '@test/render';
import {
  SAMPLE_AUDIO,
  containsRecording,
  installRecordingEnvironment,
  recordOnce,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';

import { RecordCompare } from './RecordCompare';

describe('RecordCompare: không lưu bản ghi', () => {
  beforeEach(installRecordingEnvironment);
  afterEach(restoreRecordingEnvironment);

  it('S5.1-AC3: rời bài rồi mở lại (hoặc học tiếp câu đang dở) thì không còn bản ghi', async () => {
    const first = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(first.user);
    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeEnabled();
    first.unmount();

    renderWithProviders(<RecordCompare audioPath={SAMPLE_AUDIO} />);

    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeEnabled();
  });

  it('S5.1-AC3: sang câu khác (đổi key) thì câu mới chưa có bản ghi và URL cũ bị thu hồi', async () => {
    const { user, rerender } = renderWithProviders(
      <RecordCompare key="sentence-1" audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:recording-1');

    rerender(<RecordCompare key="sentence-2" audioPath={SAMPLE_AUDIO} />);

    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeDisabled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:recording-1');
  });

  it('S5.1-AC3: ghi âm rồi rời màn thì mọi bảng IndexedDB và localStorage không chứa Blob hay chuỗi blob:', async () => {
    const db = createDatabase();
    await Promise.all(db.tables.map((table) => table.clear()));
    localStorage.clear();

    const { user, unmount } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    unmount();

    const rowsByTable = await Promise.all(
      db.tables.map((table) => table.toArray()),
    );
    db.close();
    const storedLocal = Object.keys(localStorage).map((key) => [
      key,
      localStorage.getItem(key),
    ]);

    expect(db.tables.length).toBeGreaterThan(0);
    expect(rowsByTable.some((rows) => containsRecording(rows))).toBe(false);
    expect(containsRecording(storedLocal)).toBe(false);
  });
});
