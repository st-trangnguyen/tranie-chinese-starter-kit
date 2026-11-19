import { describe, expect, it } from 'vitest';

import type { AudioIndex } from '@csk/shared';

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
  AUDIO_E,
  HSK_INDEX,
  HSK_STAGE_ID,
  HSK_TWO_UNITS_INDEX,
  HSK_UNIT_2_ID,
  HSK_UNIT_ID,
} from '@test/offline-audio.fixtures';

import { OfflineAudioService } from './offline-audio.service';

const CHAO_HOI: OfflineAudioUnit = { id: HSK_UNIT_ID, title: 'Chào hỏi' };
const GIA_DINH: OfflineAudioUnit = { id: HSK_UNIT_2_ID, title: 'Gia đình' };

function setup(
  initialCached: readonly string[] = [],
  index: AudioIndex = HSK_INDEX,
): {
  service: OfflineAudioService;
  cache: FakeAudioCache;
  snapshots: OfflineAudioSnapshot[];
} {
  const cache = new FakeAudioCache(initialCached);
  const service = new OfflineAudioService(
    cache,
    fakeContentSourceWithIndex(index),
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

  it('S8.4-AC1 Tải hai chủ đề cùng lúc: mỗi chủ đề tiến độ riêng, file dùng chung chỉ tải một lần, bấm lại khi đang tải thì không tải lại', async () => {
    const { service, cache } = setup([], HSK_TWO_UNITS_INDEX);
    await service.refresh();
    const topicOf = (unitId: string) =>
      service.deriveTopic(HSK_STAGE_ID, unitId, service.getSnapshot());

    const downloadA = service.startDownload(CHAO_HOI, true);
    await flushAsync();
    await cache.release(AUDIO_A);
    const downloadB = service.startDownload(GIA_DINH, true);
    await flushAsync();

    expect(topicOf(HSK_UNIT_ID)).toEqual({
      status: 'downloading',
      percent: 25,
    });
    expect(topicOf(HSK_UNIT_2_ID)).toEqual({
      status: 'downloading',
      percent: 0,
    });

    let isSecondClickDone = false;
    const secondClick = service.startDownload(CHAO_HOI, true).then(() => {
      isSecondClickDone = true;
    });
    await flushAsync();

    expect(isSecondClickDone).toBe(true);
    expect(
      service
        .getSnapshot()
        .announcements.map(({ kind, unitTitle }) => ({ kind, unitTitle })),
    ).toEqual([
      { kind: 'download-started', unitTitle: 'Chào hỏi' },
      { kind: 'download-started', unitTitle: 'Gia đình' },
    ]);

    for (const path of [AUDIO_B, AUDIO_C, AUDIO_D, AUDIO_E]) {
      await cache.release(path);
    }
    await Promise.all([downloadA, downloadB, secondClick]);

    expect([...cache.downloadCalls].sort()).toEqual(
      [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D, AUDIO_E].sort(),
    );
    expect(topicOf(HSK_UNIT_ID)).toEqual({
      status: 'downloaded',
      bytes: 2_516_582,
      canRemove: true,
    });
    expect(topicOf(HSK_UNIT_2_ID)).toEqual({
      status: 'downloaded',
      bytes: 1_016_582,
      canRemove: true,
    });
    expect(
      service
        .getSnapshot()
        .announcements.map(({ kind, unitTitle }) => ({ kind, unitTitle })),
    ).toEqual([
      { kind: 'download-started', unitTitle: 'Chào hỏi' },
      { kind: 'download-started', unitTitle: 'Gia đình' },
      { kind: 'download-finished', unitTitle: 'Chào hỏi' },
      { kind: 'download-finished', unitTitle: 'Gia đình' },
    ]);
  });
});
