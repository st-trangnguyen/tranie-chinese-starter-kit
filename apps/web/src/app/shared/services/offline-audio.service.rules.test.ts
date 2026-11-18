import { describe, expect, it } from 'vitest';

import { INTRO_STAGE_ID, type AudioIndex } from '@csk/shared';

import type { OfflineAudioSnapshot } from '@shared/models/offline-audio.model';

import { OfflineAudioService } from './offline-audio.service';

const HSK_STAGE_ID = 'hsk1';
const HSK_UNIT_ID = 'hsk1-greetings';

const AUDIO_A = 'audio/0000000000000001.mp3';
const AUDIO_B = 'audio/0000000000000002.mp3';
const AUDIO_C = 'audio/0000000000000003.mp3';
const AUDIO_D = 'audio/0000000000000004.mp3';
const AUDIO_INTRO = 'audio/00000000000000ff.mp3';

// Tổng 4 audio của chủ đề HSK = 2 516 582 byte ("2,4 MB").
const HSK_INDEX: AudioIndex = {
  units: {
    intro1: [AUDIO_INTRO],
    [HSK_UNIT_ID]: [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D],
  },
  bytes: {
    [AUDIO_A]: 600_000,
    [AUDIO_B]: 700_000,
    [AUDIO_C]: 616_582,
    [AUDIO_D]: 600_000,
    [AUDIO_INTRO]: 50_000,
  },
  precached: [AUDIO_INTRO],
};

function makeSnapshot(
  overrides: Partial<OfflineAudioSnapshot> = {},
): OfflineAudioSnapshot {
  return {
    index: HSK_INDEX,
    cachedPaths: new Set<string>(),
    downloadingUnitIds: new Set<string>(),
    messages: new Map(),
    announcements: [],
    ...overrides,
  };
}

describe('OfflineAudioService — Phần 2 (quy tắc)', () => {
  const service = new OfflineAudioService();

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: chủ đề HSK chưa có audio trên máy → not-downloaded, đủ byte', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot(),
    );

    expect(topic).toEqual({ status: 'not-downloaded', bytes: 2_516_582 });
  });

  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: audio trùng chỉ tính dung lượng một lần', () => {
    const bytes = HSK_INDEX.bytes;

    expect(
      service.sumBytes(
        [AUDIO_A, AUDIO_B, AUDIO_A, AUDIO_C, AUDIO_D, AUDIO_B],
        bytes,
      ),
    ).toBe(2_516_582);
  });

  it('S8.4-AC1 Thiếu một phần audio thì là chưa tải: 3/4 audio có trên máy → not-downloaded, dung lượng cả chủ đề', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot({ cachedPaths: new Set([AUDIO_A, AUDIO_B, AUDIO_C]) }),
    );

    expect(topic).toEqual({ status: 'not-downloaded', bytes: 2_516_582 });
  });

  it('S8.4-AC1 Thiếu một phần audio thì là chưa tải: chỉ file chưa có trên máy là còn thiếu', () => {
    const unitAudio = HSK_INDEX.units[HSK_UNIT_ID] ?? [];

    expect(
      service.listMissingAudio(unitAudio, new Set([AUDIO_A, AUDIO_B, AUDIO_C])),
    ).toEqual([AUDIO_D]);
    expect(service.listMissingAudio(unitAudio, new Set<string>())).toEqual([
      AUDIO_A,
      AUDIO_B,
      AUDIO_C,
      AUDIO_D,
    ]);
    expect(
      service.listMissingAudio(
        unitAudio,
        new Set([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]),
      ),
    ).toEqual([]);
  });

  it('S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa: đủ 4/4 audio trên máy, không chủ đề nào đang tải → downloaded, đủ byte, có nút xóa', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot({
        cachedPaths: new Set([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]),
      }),
    );

    expect(topic).toEqual({
      status: 'downloaded',
      bytes: 2_516_582,
      canRemove: true,
    });
  });

  it('S8.4-AC1 Đã tải thì hiện dung lượng và nút xóa: mọi audio không phải Nhập môn của chủ đề là xóa được', () => {
    const removable = service.selectRemovableAudio(
      HSK_UNIT_ID,
      HSK_INDEX,
      new Set<string>(),
    );

    expect(new Set(removable)).toEqual(
      new Set([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]),
    );
  });

  it('S8.4-AC1 Đã nghe hết audio thì là đã tải: đủ file (một file là audio Nhập môn có qua precache, còn lại có vì đã nghe), chưa từng bấm tải → downloaded, có nút xóa', () => {
    const listenedUnitId = 'hsk1-listened';
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        ...HSK_INDEX.units,
        [listenedUnitId]: [AUDIO_INTRO, AUDIO_A, AUDIO_B],
      },
    };

    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      listenedUnitId,
      makeSnapshot({
        index,
        // AUDIO_INTRO có trên máy qua precache; AUDIO_A, AUDIO_B có vì đã nghe khi online.
        cachedPaths: new Set([AUDIO_INTRO, AUDIO_A, AUDIO_B]),
      }),
    );

    expect(topic).toEqual({
      status: 'downloaded',
      bytes: 1_350_000,
      canRemove: true,
    });
  });

  it('S8.4-AC1 Chủ đề Nhập môn có sẵn offline: nhóm thuộc giai đoạn Nhập môn có audio, chưa có file nào trên máy → available-offline', () => {
    const topic = service.deriveTopic(
      INTRO_STAGE_ID,
      'intro1',
      makeSnapshot({ cachedPaths: new Set<string>() }),
    );

    expect(topic).toEqual({ status: 'available-offline' });
  });

  it('S8.4-AC1 Chủ đề HSK chỉ dùng audio Nhập môn: nhóm HSK mà mọi audio đều là audio Nhập môn (precache) → available-offline, kể cả khi chưa có file nào trên máy', () => {
    const introOnlyUnitId = 'hsk1-intro-audio-only';
    const AUDIO_INTRO_2 = 'audio/00000000000000fe.mp3';
    const index: AudioIndex = {
      units: {
        ...HSK_INDEX.units,
        intro1: [AUDIO_INTRO, AUDIO_INTRO_2],
        [introOnlyUnitId]: [AUDIO_INTRO, AUDIO_INTRO_2],
      },
      bytes: { ...HSK_INDEX.bytes, [AUDIO_INTRO_2]: 40_000 },
      precached: [AUDIO_INTRO, AUDIO_INTRO_2],
    };

    const withEmptyCache = service.deriveTopic(
      HSK_STAGE_ID,
      introOnlyUnitId,
      makeSnapshot({ index, cachedPaths: new Set<string>() }),
    );
    const withPrecachedFiles = service.deriveTopic(
      HSK_STAGE_ID,
      introOnlyUnitId,
      makeSnapshot({
        index,
        cachedPaths: new Set([AUDIO_INTRO, AUDIO_INTRO_2]),
      }),
    );

    expect(withEmptyCache).toEqual({ status: 'available-offline' });
    expect(withPrecachedFiles).toEqual({ status: 'available-offline' });
  });

  it('S8.4-AC1 Chủ đề không có audio: nhóm HSK có danh sách audio rỗng, hoặc không có trong audio index → không có khối (null)', () => {
    const emptyUnitId = 'hsk1-no-audio';
    const missingUnitId = 'hsk1-not-in-index';
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: { ...HSK_INDEX.units, [emptyUnitId]: [] },
    };
    const snapshot = makeSnapshot({ index });

    expect(service.deriveTopic(HSK_STAGE_ID, emptyUnitId, snapshot)).toBeNull();
    expect(
      service.deriveTopic(HSK_STAGE_ID, missingUnitId, snapshot),
    ).toBeNull();
  });
});
