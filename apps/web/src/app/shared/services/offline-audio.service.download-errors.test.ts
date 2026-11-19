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
});
