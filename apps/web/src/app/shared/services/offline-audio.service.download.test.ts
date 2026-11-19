import { describe, expect, it } from 'vitest';

import type {
  OfflineAudioSnapshot,
  OfflineAudioUnit,
} from '@shared/models/offline-audio.model';
import {
  FakeAudioCache,
  fakeContentSourceWithIndex,
  flushAsync,
} from '@test/offline-audio.fakes';
import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_D,
  HSK_INDEX,
  HSK_STAGE_ID,
  HSK_UNIT_ID,
} from '@test/offline-audio.fixtures';

import { OfflineAudioService } from './offline-audio.service';

const CHAO_HOI: OfflineAudioUnit = { id: HSK_UNIT_ID, title: 'Chào hỏi' };

function setup(initialCached: readonly string[] = []): {
  service: OfflineAudioService;
  cache: FakeAudioCache;
  snapshots: OfflineAudioSnapshot[];
} {
  const cache = new FakeAudioCache(initialCached);
  const service = new OfflineAudioService(
    cache,
    fakeContentSourceWithIndex(HSK_INDEX),
  );
  const snapshots: OfflineAudioSnapshot[] = [];
  service.subscribe(() => {
    snapshots.push(service.getSnapshot());
  });
  return { service, cache, snapshots };
}

describe('OfflineAudioService.startDownload', () => {
  it('S8.4-AC1 Bấm tải thì audio của chủ đề có trên máy: tải đủ 4 file thì chủ đề đã tải và đọc câu bắt đầu, xong', async () => {
    const { service, cache, snapshots } = setup();
    await service.refresh();

    const download = service.startDownload(CHAO_HOI, true);
    await flushAsync();
    for (const path of [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]) {
      await cache.release(path);
    }
    await download;

    const last = service.getSnapshot();
    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots.at(-1)).toBe(last);
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, last)).toEqual({
      status: 'downloaded',
      bytes: 2_516_582,
      canRemove: true,
    });
    expect(cache.downloadCalls).toEqual([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]);
    expect(
      last.announcements.map(({ kind, unitTitle }) => ({ kind, unitTitle })),
    ).toEqual([
      { kind: 'download-started', unitTitle: 'Chào hỏi' },
      { kind: 'download-finished', unitTitle: 'Chào hỏi' },
    ]);
  });

  it('S8.4-AC1 Hiện tiến độ khi đang tải: sau file 1 là đang tải 25%, không bao giờ 100%, file cuối và hết đang tải cùng một snapshot', async () => {
    const { service, cache, snapshots } = setup();
    await service.refresh();

    const download = service.startDownload(CHAO_HOI, true);
    await flushAsync();
    await cache.release(AUDIO_A);

    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloading', percent: 25 });

    for (const path of [AUDIO_B, AUDIO_C, AUDIO_D]) {
      await cache.release(path);
    }
    await download;

    const topics = snapshots.map((snapshot) =>
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot),
    );
    expect(topics).not.toContainEqual({ status: 'downloading', percent: 100 });
    const allAudio = [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D];
    const fullyCached = snapshots.filter((snapshot) =>
      allAudio.every((path) => snapshot.cachedPaths.has(path)),
    );
    expect(fullyCached.length).toBeGreaterThan(0);
    expect(
      fullyCached.map((snapshot) =>
        snapshot.downloadingUnitIds.has(HSK_UNIT_ID),
      ),
    ).not.toContain(true);
    const lastFileIndex = snapshots.findIndex((snapshot) =>
      snapshot.cachedPaths.has(AUDIO_D),
    );
    const finishedIndex = snapshots.findIndex(
      (snapshot, position) =>
        position > 0 && !snapshot.downloadingUnitIds.has(HSK_UNIT_ID),
    );
    expect(finishedIndex).toBe(lastFileIndex);
  });

  it('S8.4-AC1 Tải lại chỉ tải phần còn thiếu: 2/4 file đã có thì chỉ tải 2 file thiếu, ngay khi bấm là đang tải 50%', async () => {
    const { service, cache, snapshots } = setup([AUDIO_A, AUDIO_B]);
    await service.refresh();
    const beforeClick = snapshots.length;

    const download = service.startDownload(CHAO_HOI, true);
    await flushAsync();

    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshots[beforeClick]),
    ).toEqual({ status: 'downloading', percent: 50 });

    // Thả cả 2 file đã có (trước, theo thứ tự chủ đề) để lượt tải vẫn kết thúc nếu service tải lại
    // chúng: test khi đó fail ở assertion, không treo.
    for (const path of [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]) {
      await cache.release(path);
    }
    await download;

    expect(cache.downloadCalls).toEqual([AUDIO_C, AUDIO_D]);
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloaded', bytes: 2_516_582, canRemove: true });
  });
});
