import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderWithProviders, screen } from '@test/render';
import {
  SAMPLE_AUDIO,
  fakeAudio,
  installRecordingEnvironment,
  recordOnce,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';

import { RecordCompare } from './RecordCompare';

describe('RecordCompare: nghe mẫu và nghe bản ghi', () => {
  beforeEach(installRecordingEnvironment);
  afterEach(restoreRecordingEnvironment);

  it('S5.1-AC2: chưa ghi thì Nghe mẫu bấm được, Nghe bản ghi không bấm được', () => {
    renderWithProviders(<RecordCompare audioPath={SAMPLE_AUDIO} />);

    expect(screen.getByRole('button', { name: 'Nghe mẫu' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeDisabled();
  });

  it('S5.1-AC2: bấm Nghe mẫu thì phát audioPath một lần từ đầu', async () => {
    const playSpy = vi.spyOn(fakeAudio, 'play');
    fakeAudio.currentTime = 7;
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );

    await user.click(screen.getByRole('button', { name: 'Nghe mẫu' }));

    expect(fakeAudio.src).toBe(`/${SAMPLE_AUDIO}`);
    expect(fakeAudio.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalledTimes(1);
    playSpy.mockRestore();
  });

  it('S5.1-AC2: đã ghi rồi bấm Nghe bản ghi thì bản ghi phát một lần từ đầu', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    const playSpy = vi.spyOn(fakeAudio, 'play');
    fakeAudio.currentTime = 7;

    await user.click(screen.getByRole('button', { name: 'Nghe bản ghi' }));

    expect(fakeAudio.src).toBe('blob:recording-1');
    expect(fakeAudio.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalledTimes(1);
    playSpy.mockRestore();
  });

  it('S5.1-AC2: Nghe bản ghi rồi Nghe mẫu thì bản ghi dừng, mẫu phát từ đầu, chỉ một luồng', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    await user.click(screen.getByRole('button', { name: 'Nghe bản ghi' }));
    const pauseSpy = vi.spyOn(fakeAudio, 'pause');
    const playSpy = vi.spyOn(fakeAudio, 'play');
    fakeAudio.currentTime = 3;

    await user.click(screen.getByRole('button', { name: 'Nghe mẫu' }));

    expect(pauseSpy).toHaveBeenCalled();
    expect(fakeAudio.src).toBe(`/${SAMPLE_AUDIO}`);
    expect(fakeAudio.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalledTimes(1);
    pauseSpy.mockRestore();
    playSpy.mockRestore();
  });

  it('S5.1-AC2: nghe bản ghi 5 lần, mỗi lần sau khi phát xong, thì phát đủ 5 và nút vẫn bấm được', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    const playSpy = vi.spyOn(fakeAudio, 'play');

    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Nghe bản ghi' }));
      await act(async () => {
        fakeAudio.dispatchEvent(new Event('ended'));
      });
    }

    expect(playSpy).toHaveBeenCalledTimes(5);
    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeEnabled();
    playSpy.mockRestore();
  });

  it('S5.1-AC2: đang ghi lại thì Nghe bản ghi bị khóa, Nghe mẫu vẫn bấm được (design D4)', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByText('Đang ghi âm');

    expect(screen.getByRole('button', { name: 'Nghe bản ghi' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Nghe mẫu' })).toBeEnabled();
  });

  it('S5.1-AC2: bản ghi không phát được thì hiện thông báo lỗi, Ghi âm và Nghe mẫu vẫn bấm được', async () => {
    const { user } = renderWithProviders(
      <RecordCompare audioPath={SAMPLE_AUDIO} />,
    );
    await recordOnce(user);

    await user.click(screen.getByRole('button', { name: 'Nghe bản ghi' }));
    await act(async () => {
      fakeAudio.dispatchEvent(new Event('error'));
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không phát được bản ghi.',
    );
    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Nghe mẫu' })).toBeEnabled();
  });
});
