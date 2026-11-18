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

  it('S8.4-AC1 Chủ đề Nhập môn không có audio thì không có khối: nhóm thuộc giai đoạn Nhập môn có danh sách audio rỗng → null, không phải available-offline', () => {
    const emptyIntroUnitId = 'intro-no-audio';
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: { ...HSK_INDEX.units, [emptyIntroUnitId]: [] },
    };

    expect(
      service.deriveTopic(
        INTRO_STAGE_ID,
        emptyIntroUnitId,
        makeSnapshot({ index }),
      ),
    ).toBeNull();
  });

  it('S8.4-AC1 Hiện tiến độ khi đang tải: chủ đề HSK 4 audio đang tải, 1/4 file có trên máy → downloading 25%', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot({
        cachedPaths: new Set([AUDIO_A]),
        downloadingUnitIds: new Set([HSK_UNIT_ID]),
      }),
    );

    expect(topic).toEqual({ status: 'downloading', percent: 25 });
  });

  it('S8.4-AC1 Tiến độ tính cả file đã có từ trước: chủ đề HSK 4 audio đang tải, 3/4 file có trên máy (gồm file có từ trước) → downloading 75%', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot({
        cachedPaths: new Set([AUDIO_A, AUDIO_B, AUDIO_C]),
        downloadingUnitIds: new Set([HSK_UNIT_ID]),
      }),
    );

    expect(topic).toEqual({ status: 'downloading', percent: 75 });
  });

  it('S8.4-AC1 Tiến độ tính cả file đã có từ trước: đang tải mà đủ 4/4 file trên máy → downloaded, không dừng ở downloading 100%', () => {
    const topic = service.deriveTopic(
      HSK_STAGE_ID,
      HSK_UNIT_ID,
      makeSnapshot({
        cachedPaths: new Set([AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]),
        downloadingUnitIds: new Set([HSK_UNIT_ID]),
      }),
    );

    expect(topic).toMatchObject({ status: 'downloaded', bytes: 2_516_582 });
    expect(topic).not.toHaveProperty('percent');
  });
  it('S8.4-AC2 Chủ đề dùng chung audio vòng tròn vẫn xóa được: A={x,y}, B={y,z}, C={x,z} đủ file, không chủ đề nào đang tải → cả ba có nút xóa, xóa A chọn {x,y}', () => {
    const unitA = 'hsk1-circle-a';
    const unitB = 'hsk1-circle-b';
    const unitC = 'hsk1-circle-c';
    const x = AUDIO_A;
    const y = AUDIO_B;
    const z = AUDIO_C;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [x, y],
        [unitB]: [y, z],
        [unitC]: [x, z],
      },
    };
    const snapshot = makeSnapshot({
      index,
      cachedPaths: new Set([x, y, z]),
      downloadingUnitIds: new Set<string>(),
    });

    expect(service.deriveTopic(HSK_STAGE_ID, unitA, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 1_300_000,
      canRemove: true,
    });
    expect(service.deriveTopic(HSK_STAGE_ID, unitB, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 1_316_582,
      canRemove: true,
    });
    expect(service.deriveTopic(HSK_STAGE_ID, unitC, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 1_216_582,
      canRemove: true,
    });
    expect(
      new Set(service.selectRemovableAudio(unitA, index, new Set<string>())),
    ).toEqual(new Set([x, y]));
  });

  it('S8.4-AC2 Hai chủ đề cùng bộ audio vẫn xóa được: A, B cùng bộ {x,y}, đủ file, không chủ đề nào đang tải → cả hai có nút xóa, xóa A chọn mọi file của A', () => {
    const unitA = 'hsk1-same-set-a';
    const unitB = 'hsk1-same-set-b';
    const x = AUDIO_A;
    const y = AUDIO_B;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [x, y],
        [unitB]: [x, y],
      },
    };
    const snapshot = makeSnapshot({
      index,
      cachedPaths: new Set([x, y]),
      downloadingUnitIds: new Set<string>(),
    });

    expect(service.deriveTopic(HSK_STAGE_ID, unitA, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 1_300_000,
      canRemove: true,
    });
    expect(service.deriveTopic(HSK_STAGE_ID, unitB, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 1_300_000,
      canRemove: true,
    });
    expect(
      new Set(service.selectRemovableAudio(unitA, index, new Set<string>())),
    ).toEqual(new Set([x, y]));
  });

  it('S8.4-AC2 Chủ đề đã tải luôn có nút xóa khi không có chủ đề nào đang tải: A={x,intro} ⊆ B={x,y,intro}, x không phải Nhập môn, đủ file, không chủ đề nào đang tải → A có nút xóa', () => {
    const unitA = 'hsk1-subset-a';
    const unitB = 'hsk1-subset-b';
    const x = AUDIO_A;
    const y = AUDIO_B;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [x, AUDIO_INTRO],
        [unitB]: [x, y, AUDIO_INTRO],
      },
    };
    const snapshot = makeSnapshot({
      index,
      cachedPaths: new Set([x, y, AUDIO_INTRO]),
      downloadingUnitIds: new Set<string>(),
    });

    expect(service.deriveTopic(HSK_STAGE_ID, unitB, snapshot)).toMatchObject({
      status: 'downloaded',
    });
    expect(service.deriveTopic(HSK_STAGE_ID, unitA, snapshot)).toEqual({
      status: 'downloaded',
      bytes: 650_000,
      canRemove: true,
    });
  });

  it('S8.4-AC2 Audio đang được chủ đề khác tải thì tạm chưa có nút xóa: A={x,intro} đủ file, C={x,y} đang tải (thiếu y) → A không có nút xóa; C hết tải → A có nút xóa', () => {
    const unitA = 'hsk1-busy-a';
    const unitC = 'hsk1-busy-c';
    const x = AUDIO_A;
    const y = AUDIO_B;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [x, AUDIO_INTRO],
        [unitC]: [x, y],
      },
    };
    const cachedPaths = new Set([x, AUDIO_INTRO]);
    const whileCDownloading = makeSnapshot({
      index,
      cachedPaths,
      downloadingUnitIds: new Set([unitC]),
    });
    const afterCStopped = makeSnapshot({
      index,
      cachedPaths,
      downloadingUnitIds: new Set<string>(),
    });

    expect(
      service.deriveTopic(HSK_STAGE_ID, unitC, whileCDownloading),
    ).toMatchObject({ status: 'downloading' });
    expect(service.deriveTopic(HSK_STAGE_ID, unitA, whileCDownloading)).toEqual(
      {
        status: 'downloaded',
        bytes: 650_000,
        canRemove: false,
      },
    );
    expect(service.deriveTopic(HSK_STAGE_ID, unitA, afterCStopped)).toEqual({
      status: 'downloaded',
      bytes: 650_000,
      canRemove: true,
    });
  });

  it('S8.4-AC2 Xóa không làm mất audio Nhập môn: chủ đề HSK={x,intro} (intro ∈ precached) đủ file, không chủ đề nào đang tải → xóa chỉ chọn x, không chọn path nào ∈ precached', () => {
    const unitHsk = 'hsk1-shares-intro';
    const x = AUDIO_A;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitHsk]: [x, AUDIO_INTRO],
      },
    };
    const snapshot = makeSnapshot({
      index,
      cachedPaths: new Set([x, AUDIO_INTRO]),
      downloadingUnitIds: new Set<string>(),
    });

    const removable = service.selectRemovableAudio(
      unitHsk,
      index,
      new Set<string>(),
    );

    expect(removable.filter((path) => index.precached.includes(path))).toEqual(
      [],
    );
    expect(removable).toEqual([x]);
    expect(service.deriveTopic(INTRO_STAGE_ID, 'intro1', snapshot)).toEqual({
      status: 'available-offline',
    });
  });
});
