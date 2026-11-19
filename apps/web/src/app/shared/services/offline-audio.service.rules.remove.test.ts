import { describe, expect, it } from 'vitest';

import { INTRO_STAGE_ID, type AudioIndex } from '@csk/shared';

import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_INTRO,
  HSK_INDEX,
  HSK_STAGE_ID,
  makeSnapshot,
} from '@test/offline-audio.fixtures';

import { OfflineAudioService } from './offline-audio.service';

describe('OfflineAudioService — Phần 2 (quy tắc)', () => {
  const service = new OfflineAudioService();

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

  it('S8.4-AC2 Xóa không làm hỏng chủ đề khác đang tải: B={s,b} đủ file, A={s,a} đang tải (thiếu a), s không phải Nhập môn → xóa B không chọn s, vẫn chọn b', () => {
    const unitA = 'hsk1-loading-a';
    const unitB = 'hsk1-loaded-b';
    const s = AUDIO_A;
    const a = AUDIO_B;
    const b = AUDIO_C;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [s, a],
        [unitB]: [s, b],
      },
    };
    const downloadingUnitIds = new Set([unitA]);
    const snapshot = makeSnapshot({
      index,
      cachedPaths: new Set([s, b, AUDIO_INTRO]),
      downloadingUnitIds,
    });

    expect(service.deriveTopic(HSK_STAGE_ID, unitA, snapshot)).toMatchObject({
      status: 'downloading',
    });
    expect(service.deriveTopic(HSK_STAGE_ID, unitB, snapshot)).toMatchObject({
      status: 'downloaded',
    });

    const removable = service.selectRemovableAudio(
      unitB,
      index,
      downloadingUnitIds,
    );

    expect(removable).not.toContain(s);
    expect(removable).toEqual([b]);
  });

  it('S8.4-AC2 Xóa audio dùng chung thì chủ đề khác đã tải về chưa tải: A={s,a}, B={s,b} đủ file, s không phải Nhập môn, không ai tải → xóa A chọn s; bỏ file đã chọn khỏi máy thì B là not-downloaded', () => {
    const unitA = 'hsk1-shared-a';
    const unitB = 'hsk1-shared-b';
    const s = AUDIO_A;
    const a = AUDIO_B;
    const b = AUDIO_C;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [s, a],
        [unitB]: [s, b],
      },
    };
    const cachedPaths = new Set([s, a, b, AUDIO_INTRO]);
    const downloadingUnitIds = new Set<string>();
    const before = makeSnapshot({ index, cachedPaths, downloadingUnitIds });

    expect(service.deriveTopic(HSK_STAGE_ID, unitB, before)).toMatchObject({
      status: 'downloaded',
    });

    const removable = service.selectRemovableAudio(
      unitA,
      index,
      downloadingUnitIds,
    );

    expect(removable).toContain(s);

    const removedPaths = new Set(removable);
    const after = makeSnapshot({
      index,
      cachedPaths: new Set(
        [...cachedPaths].filter((path) => !removedPaths.has(path)),
      ),
      downloadingUnitIds,
    });

    expect(service.deriveTopic(HSK_STAGE_ID, unitB, after)).toEqual({
      status: 'not-downloaded',
      bytes: 1_216_582,
    });
  });
});
