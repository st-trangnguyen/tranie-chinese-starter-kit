import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen } from '@test/render';
import {
  SAMPLE_AUDIO,
  createFakeStream,
  fakeAudio,
  installRecordingEnvironment,
  restoreRecordingEnvironment,
  stubMediaDevices,
} from '@test/record-compare.helpers';

import { RecordCompare } from './RecordCompare';

describe('RecordCompare: ghi âm', () => {
  beforeEach(installRecordingEnvironment);
  afterEach(restoreRecordingEnvironment);

  it('S5.1-AC1: chưa ghi thì có nút Ghi âm, không có Đang ghi âm', () => {
    renderWithProviders(<RecordCompare audioPath={SAMPLE_AUDIO} />);

    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeEnabled();
    expect(screen.queryByText('Đang ghi âm')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Dừng' }),
    ).not.toBeInTheDocument();
  });

  it('S5.1-AC1: bấm Ghi âm thì hiện Đang ghi âm và nút đổi thành Dừng', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(await screen.findByText('Đang ghi âm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dừng' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
  });

  it('S5.1-AC1: bấm Dừng thì hết Đang ghi âm, nút lại là Ghi âm và Nghe bản ghi bấm được', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(await screen.findByRole('button', { name: 'Dừng' }));

    expect(await screen.findByRole('button', { name: 'Ghi âm' })).toBeEnabled();
    expect(screen.queryByText('Đang ghi âm')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeEnabled();
  });

  it('S5.1-AC1: ghi lại thì bản mới thay bản cũ, Nghe bản ghi phát URL mới', async () => {
    URL.createObjectURL = vi
      .fn<(obj: Blob | MediaSource) => string>()
      .mockReturnValueOnce('blob:recording-1')
      .mockReturnValueOnce('blob:recording-2');
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(await screen.findByRole('button', { name: 'Dừng' }));
    await user.click(await screen.findByRole('button', { name: 'Ghi âm' }));
    await user.click(await screen.findByRole('button', { name: 'Dừng' }));
    await user.click(
      await screen.findByRole('button', { name: 'Nghe bản ghi' }),
    );

    expect(fakeAudio.src).toBe('blob:recording-2');
  });

  it('S5.1-AC1: đang phát bản mẫu mà bấm Ghi âm thì audio dừng và bắt đầu ghi', async () => {
    const pauseSpy = vi.spyOn(fakeAudio, 'pause');
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Nghe mẫu' }));
    pauseSpy.mockClear();
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(await screen.findByText('Đang ghi âm')).toBeInTheDocument();
    expect(pauseSpy).toHaveBeenCalled();
    pauseSpy.mockRestore();
  });

  it('S5.1-AC1: đang phát bản ghi mà bấm Ghi âm thì audio dừng và bắt đầu ghi', async () => {
    const pauseSpy = vi.spyOn(fakeAudio, 'pause');
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(await screen.findByRole('button', { name: 'Dừng' }));
    await user.click(
      await screen.findByRole('button', { name: 'Nghe bản ghi' }),
    );
    pauseSpy.mockClear();
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(await screen.findByText('Đang ghi âm')).toBeInTheDocument();
    expect(pauseSpy).toHaveBeenCalled();
    pauseSpy.mockRestore();
  });

  it('S5.1-AC1: rời màn khi đang ghi thì dừng ghi và micro được nhả', async () => {
    const stopTrack = vi.fn();
    stubMediaDevices({
      getUserMedia: () => Promise.resolve(createFakeStream(stopTrack)),
    });
    const { user, unmount } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByText('Đang ghi âm');
    expect(stopTrack).not.toHaveBeenCalled();
    unmount();

    expect(stopTrack).toHaveBeenCalled();
  });

  it('kỹ thuật, không có Scenario: micro không dùng được thì bấm Ghi âm không làm hỏng màn, các nút vẫn bấm được', async () => {
    const getUserMedia = vi.fn(() =>
      Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
    );
    stubMediaDevices({ getUserMedia });
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Đang ghi âm')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Nghe mẫu' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeDisabled();
  });
});
