import { describe, expect, it } from 'vitest';

import type { OfflineAudioUnit } from '@shared/models/offline-audio.model';
import { OfflineAudioService } from '@shared/services/offline-audio.service';
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

const CHAO_HOI: OfflineAudioUnit = { id: HSK_UNIT_ID, title: 'Chào hỏi' };

/** Một lần mở app: service mới (không nhớ gì trong bộ nhớ) trên cùng cache của trình duyệt. */
const openApp = (cache: FakeAudioCache): OfflineAudioService =>
  new OfflineAudioService(cache, fakeContentSourceWithIndex(HSK_INDEX));

describe('OfflineAudioService: mở lại app', () => {
  it('S8.4-AC1 Mở lại app vẫn thấy đã tải: tải xong ở lần mở trước thì lần mở sau refresh là đã tải', async () => {
    const cache = new FakeAudioCache();
    const firstOpen = openApp(cache);
    await firstOpen.refresh();
    const download = firstOpen.startDownload(CHAO_HOI, true);
    await flushAsync();
    for (const path of [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]) {
      await cache.release(path);
    }
    await download;

    const secondOpen = openApp(cache);
    await secondOpen.refresh();

    expect(
      secondOpen.deriveTopic(
        HSK_STAGE_ID,
        HSK_UNIT_ID,
        secondOpen.getSnapshot(),
      ),
    ).toEqual({ status: 'downloaded', bytes: 2_516_582, canRemove: true });
    expect(cache.downloadCalls).toEqual([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]);
  });

  it('S8.4-AC1 Đóng app giữa chừng: lần mở sau là chưa tải (không phải đang tải) và 2 file đã tải vẫn trong cache', async () => {
    const cache = new FakeAudioCache();
    const firstOpen = openApp(cache);
    await firstOpen.refresh();
    void firstOpen.startDownload(CHAO_HOI, true);
    await flushAsync();
    await cache.release(AUDIO_A);
    await cache.release(AUDIO_B);
    // Đóng app: lần mở trước bị bỏ, AUDIO_C và AUDIO_D không bao giờ tải xong.

    const secondOpen = openApp(cache);
    await secondOpen.refresh();

    expect(
      secondOpen.deriveTopic(
        HSK_STAGE_ID,
        HSK_UNIT_ID,
        secondOpen.getSnapshot(),
      ),
    ).toEqual({ status: 'not-downloaded', bytes: 2_516_582 });
    expect(cache.cachedPaths).toEqual(new Set([AUDIO_A, AUDIO_B]));
  });
});
