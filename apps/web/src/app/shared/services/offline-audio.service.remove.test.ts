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
  AUDIO_E,
  AUDIO_INTRO,
  HSK_STAGE_ID,
  HSK_TWO_UNITS_INDEX,
  HSK_WITH_INTRO_AUDIO_INDEX,
  HSK_UNIT_2_ID,
  HSK_UNIT_ID,
} from '@test/offline-audio.fixtures';

const CHAO_HOI: OfflineAudioUnit = { id: HSK_UNIT_ID, title: 'Chào hỏi' };
const GIA_DINH: OfflineAudioUnit = { id: HSK_UNIT_2_ID, title: 'Gia đình' };

describe('OfflineAudioService.removeAudio', () => {
  it('S8.4-AC1 Thông báo của mỗi chủ đề độc lập: A đang báo cần có mạng, xóa audio của B thì A vẫn giữ thông báo, B có thông báo đã xóa', async () => {
    const { service } = setupOfflineAudioService(
      [AUDIO_C, AUDIO_E],
      HSK_TWO_UNITS_INDEX,
    );
    await service.refresh();
    await service.startDownload(CHAO_HOI, false);

    await service.removeAudio(GIA_DINH);

    const snapshot = service.getSnapshot();
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'needs-network',
      shownWith: 'not-downloaded',
    });
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_516_582,
    });
    expect(snapshot.messages.get(HSK_UNIT_2_ID)).toEqual({
      kind: 'removed',
      shownWith: 'not-downloaded',
    });
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([
      { kind: 'needs-network', unitTitle: 'Chào hỏi' },
      { kind: 'removed', unitTitle: 'Gia đình' },
    ]);
  });

  it('S8.4-AC2 Xóa audio đã tải: chủ đề đã tải bấm xóa thì xóa đúng audio của chủ đề (giữ audio Nhập môn), chủ đề về chưa tải kèm thông báo đã xóa', async () => {
    const { service, cache } = setupOfflineAudioService(
      [AUDIO_A, AUDIO_B, AUDIO_INTRO, AUDIO_C, AUDIO_D],
      HSK_WITH_INTRO_AUDIO_INDEX,
    );
    await service.refresh();
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloaded', bytes: 2_566_582, canRemove: true });

    await service.removeAudio(CHAO_HOI);

    expect(cache.removeCalls).toHaveLength(1);
    expect([...(cache.removeCalls[0] ?? [])].sort()).toEqual(
      [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D].sort(),
    );
    expect(cache.cachedPaths).toEqual(new Set([AUDIO_INTRO]));
    const snapshot = service.getSnapshot();
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_566_582,
    });
    expect(snapshot.cachedPaths.has(AUDIO_INTRO)).toBe(true);
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'removed',
      shownWith: 'not-downloaded',
    });
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([{ kind: 'removed', unitTitle: 'Chào hỏi' }]);
  });
  it('S8.4-AC2 Xóa không làm hỏng chủ đề khác đang tải: B đã tải, A đang tải đã có file chung, xóa B giữa chừng thì file chung còn, A tải xong và tiến độ A không lùi', async () => {
    const { service, cache, snapshots } = setupOfflineAudioService(
      [AUDIO_C, AUDIO_E],
      HSK_TWO_UNITS_INDEX,
    );
    await service.refresh();
    const download = service.startDownload(CHAO_HOI, true);
    await flushAsync();
    await cache.release(AUDIO_A);
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloading', percent: 50 });

    await service.removeAudio(GIA_DINH);

    expect(cache.removeCalls).toHaveLength(1);
    expect(cache.removeCalls[0]).not.toContain(AUDIO_C);
    expect(cache.cachedPaths.has(AUDIO_C)).toBe(true);
    expect(service.getSnapshot().cachedPaths.has(AUDIO_C)).toBe(true);
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_2_ID, service.getSnapshot()),
    ).toEqual({ status: 'not-downloaded', bytes: 1_016_582 });

    await cache.release(AUDIO_B);
    await cache.release(AUDIO_D);
    await download;

    const finalSnapshot = service.getSnapshot();
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, finalSnapshot),
    ).toEqual({ status: 'downloaded', bytes: 2_516_582, canRemove: true });
    expect(cache.cachedPaths.has(AUDIO_C)).toBe(true);
    expect(finalSnapshot.cachedPaths.has(AUDIO_C)).toBe(true);

    const percents = snapshots.flatMap((snapshot) => {
      const topic = service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot);
      return topic?.status === 'downloading' ? [topic.percent] : [];
    });
    expect(percents.length).toBeGreaterThan(0);
    percents.forEach((percent, position) => {
      expect(percent).toBeGreaterThanOrEqual(percents[position - 1] ?? 0);
    });
  });

  it('S8.4-AC2 Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải: A, B đã tải chung một audio, xóa A thì B về chưa tải, B không có thông báo, audio chỉ thuộc B còn', async () => {
    const { service, cache } = setupOfflineAudioService(
      [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D, AUDIO_E],
      HSK_TWO_UNITS_INDEX,
    );
    await service.refresh();
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloaded', bytes: 2_516_582, canRemove: true });
    expect(
      service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_2_ID, service.getSnapshot()),
    ).toEqual({ status: 'downloaded', bytes: 1_016_582, canRemove: true });

    await service.removeAudio(CHAO_HOI);

    expect(cache.removeCalls).toHaveLength(1);
    expect([...(cache.removeCalls[0] ?? [])].sort()).toEqual(
      [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D].sort(),
    );
    expect(cache.cachedPaths).toEqual(new Set([AUDIO_E]));
    const snapshot = service.getSnapshot();
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 2_516_582,
    });
    expect(service.deriveTopic(HSK_STAGE_ID, HSK_UNIT_2_ID, snapshot)).toEqual({
      status: 'not-downloaded',
      bytes: 1_016_582,
    });
    expect(snapshot.cachedPaths.has(AUDIO_E)).toBe(true);
    expect(snapshot.messages.get(HSK_UNIT_ID)).toEqual({
      kind: 'removed',
      shownWith: 'not-downloaded',
    });
    expect(snapshot.messages.has(HSK_UNIT_2_ID)).toBe(false);
    expect(
      snapshot.announcements.map(({ kind, unitTitle }) => ({
        kind,
        unitTitle,
      })),
    ).toEqual([{ kind: 'removed', unitTitle: 'Chào hỏi' }]);
  });
});
