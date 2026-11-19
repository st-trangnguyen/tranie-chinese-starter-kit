import { describe, expect, it } from 'vitest';

import type { OfflineAudioUnit } from '@shared/models/offline-audio.model';
import {
  flushAsync,
  setupOfflineAudioService,
} from '@test/offline-audio.fakes';
import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_D,
  HSK_STAGE_ID,
  HSK_UNIT_ID,
} from '@test/offline-audio.fixtures';

const CHAO_HOI: OfflineAudioUnit = { id: HSK_UNIT_ID, title: 'Chào hỏi' };

describe('OfflineAudioService.startDownload khi không tải được', () => {
  it('S8.4-AC1 Bấm tải khi không có mạng: không tải file nào, chủ đề có thông báo và câu đọc cần có mạng, vẫn chưa tải', async () => {
    const { service, cache } = setupOfflineAudioService();
    await service.refresh();

    let isDone = false;
    const download = service.startDownload(CHAO_HOI, false).then(() => {
      isDone = true;
    });
    await flushAsync();

    expect(cache.downloadCalls).toEqual([]);
    expect(isDone).toBe(true);

    const snapshot = service.getSnapshot();
    expect(snapshot.downloadingUnitIds.has(HSK_UNIT_ID)).toBe(false);
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_516_582,
    });
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'needs-network',
      shownWith: 'not-downloaded',
    });
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([{ kind: 'needs-network', unitTitle: 'Chào hỏi' }]);

    // Nếu service vẫn tải (hành vi sai) thì thả file để promise kết thúc, không treo test.
    for (const path of [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]) {
      await cache.release(path);
    }
    await download;
  });

  it('S8.4-AC1 Mất mạng khi đang tải: xong 2/4 file thì lỗi mạng, hết đang tải, thông báo và câu đọc tải chưa xong, 2 file vẫn trên máy, chủ đề chưa tải', async () => {
    const { service, cache } = setupOfflineAudioService();
    await service.refresh();

    let settled: 'pending' | 'resolved' | 'rejected' = 'pending';
    const download = service.startDownload(CHAO_HOI, true).then(
      () => {
        settled = 'resolved';
      },
      () => {
        settled = 'rejected';
      },
    );
    await flushAsync();
    await cache.release(AUDIO_A);
    await cache.release(AUDIO_B);
    await cache.fail(AUDIO_C, 'network');
    await flushAsync();

    expect(settled).toBe('resolved');

    const snapshot = service.getSnapshot();
    expect(snapshot.downloadingUnitIds.has(HSK_UNIT_ID)).toBe(false);
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_516_582,
    });
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'download-incomplete',
      shownWith: 'not-downloaded',
    });
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([
      { kind: 'download-started', unitTitle: 'Chào hỏi' },
      { kind: 'download-incomplete', unitTitle: 'Chào hỏi' },
    ]);
    expect(cache.cachedPaths).toEqual(new Set([AUDIO_A, AUDIO_B]));
    expect(snapshot.cachedPaths.has(AUDIO_A)).toBe(true);
    expect(snapshot.cachedPaths.has(AUDIO_B)).toBe(true);
    expect(cache.downloadCalls).toEqual([AUDIO_A, AUDIO_B, AUDIO_C]);

    // Nếu service vẫn tải tiếp (hành vi sai) thì thả file còn lại để promise kết thúc, không treo test.
    await cache.release(AUDIO_D);
    await download;
  });

  it('S8.4-AC1 Không đủ bộ nhớ: xong 1/4 file thì máy hết bộ nhớ, hết đang tải, thông báo và câu đọc không đủ bộ nhớ, file đã tải giữ nguyên, chủ đề chưa tải', async () => {
    const { service, cache } = setupOfflineAudioService();
    await service.refresh();

    let settled: 'pending' | 'resolved' | 'rejected' = 'pending';
    const download = service.startDownload(CHAO_HOI, true).then(
      () => {
        settled = 'resolved';
      },
      () => {
        settled = 'rejected';
      },
    );
    await flushAsync();
    await cache.release(AUDIO_A);
    await cache.fail(AUDIO_B, 'storage-full');
    await flushAsync();

    expect(settled).toBe('resolved');

    const snapshot = service.getSnapshot();
    expect(snapshot.downloadingUnitIds.has(HSK_UNIT_ID)).toBe(false);
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_516_582,
    });
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'storage-full',
      shownWith: 'not-downloaded',
    });
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([
      { kind: 'download-started', unitTitle: 'Chào hỏi' },
      { kind: 'storage-full', unitTitle: 'Chào hỏi' },
    ]);
    expect(cache.cachedPaths).toEqual(new Set([AUDIO_A]));
    expect(snapshot.cachedPaths.has(AUDIO_A)).toBe(true);
    expect(cache.downloadCalls).toEqual([AUDIO_A, AUDIO_B]);

    // Nếu service vẫn tải tiếp (hành vi sai) thì thả file còn lại để promise kết thúc, không treo test.
    await cache.release(AUDIO_C);
    await cache.release(AUDIO_D);
    await download;
  });

  it('S8.4-AC1 Thông báo mất khi bấm nút kế tiếp: chủ đề đang có thông báo tải chưa xong, có mạng và bấm tải lại thì thông báo mất ngay, chủ đề đang tải', async () => {
    const { service, cache, snapshots } = setupOfflineAudioService();
    await service.refresh();

    const firstTry = service.startDownload(CHAO_HOI, true);
    await flushAsync();
    await cache.release(AUDIO_A);
    await cache.release(AUDIO_B);
    await cache.fail(AUDIO_C, 'network');
    await firstTry;
    expect(service.getSnapshot().messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'download-incomplete',
      shownWith: 'not-downloaded',
    });

    const emittedBefore = snapshots.length;
    const retry = service.startDownload(CHAO_HOI, true);
    await flushAsync();

    const afterClick = snapshots[emittedBefore];
    expect(afterClick).toBeDefined();
    expect(afterClick?.messages.has(HSK_UNIT_ID)).toBe(false);
    expect(afterClick?.downloadingUnitIds.has(HSK_UNIT_ID)).toBe(true);

    const snapshot = service.getSnapshot();
    expect(snapshot.messages.has(HSK_UNIT_ID)).toBe(false);
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot),
    ).toMatchObject({ status: 'downloading' });

    // Thả file còn lại để lượt tải lại kết thúc, không treo test.
    await cache.release(AUDIO_C);
    await cache.release(AUDIO_D);
    await retry;
  });
});
