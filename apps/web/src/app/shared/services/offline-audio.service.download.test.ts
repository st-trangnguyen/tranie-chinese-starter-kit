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
});
