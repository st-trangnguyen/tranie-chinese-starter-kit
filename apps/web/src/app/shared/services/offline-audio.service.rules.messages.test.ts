import { describe, expect, it } from 'vitest';

import { type AudioIndex, type Stage } from '@csk/shared';

import type {
  OfflineAudioMessage,
  OfflineAudioTopic,
} from '@shared/models/offline-audio.model';

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

  it('S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì: thông báo của A hiện lúc not-downloaded, A giờ downloaded → bỏ; A vẫn not-downloaded → giữ; thông báo của B không đổi', () => {
    const unitA = 'hsk1-message-a';
    const unitB = 'hsk1-message-b';
    const messageA: OfflineAudioMessage = {
      kind: 'download-incomplete',
      shownWith: 'not-downloaded',
    };
    const messageB: OfflineAudioMessage = {
      kind: 'needs-network',
      shownWith: 'not-downloaded',
    };
    const messages = new Map([
      [unitA, messageA],
      [unitB, messageB],
    ]);
    const topicB: OfflineAudioTopic = {
      status: 'not-downloaded',
      bytes: 700_000,
    };

    const afterAChanged = service.pruneStaleMessages(
      messages,
      new Map<string, OfflineAudioTopic>([
        [unitA, { status: 'downloaded', bytes: 1_300_000, canRemove: true }],
        [unitB, topicB],
      ]),
    );

    expect(afterAChanged.has(unitA)).toBe(false);
    expect(afterAChanged.get(unitB)).toEqual(messageB);

    const afterAUnchanged = service.pruneStaleMessages(
      messages,
      new Map<string, OfflineAudioTopic>([
        [unitA, { status: 'not-downloaded', bytes: 600_000 }],
        [unitB, topicB],
      ]),
    );

    expect(afterAUnchanged.get(unitA)).toEqual(messageA);
    expect(afterAUnchanged.get(unitB)).toEqual(messageB);
  });

  it('S8.4-AC1 Thông báo mất khi trạng thái đổi mà không bấm gì: deriveTopics gắn thông báo còn hiệu lực vào khối, bỏ thông báo khi A đã đủ audio nhờ B tải xong audio dùng chung; nhóm không có audio không có khối', () => {
    const unitA = 'hsk1-shared-a';
    const unitB = 'hsk1-shared-b';
    const unitEmpty = 'hsk1-empty';
    const unitMissing = 'hsk1-not-in-index';
    const s = AUDIO_A;
    const a = AUDIO_B;
    const b = AUDIO_C;
    const index: AudioIndex = {
      ...HSK_INDEX,
      units: {
        intro1: [AUDIO_INTRO],
        [unitA]: [s, a],
        [unitB]: [s, b],
        [unitEmpty]: [],
      },
    };
    const stages: Stage[] = [
      {
        id: HSK_STAGE_ID,
        title: 'HSK 1',
        units: [unitA, unitB, unitEmpty, unitMissing].map((id) => ({
          id,
          title: id,
          lessonIds: [`${id}-lesson`],
        })),
      },
    ];
    const messageA: OfflineAudioMessage = {
      kind: 'download-incomplete',
      shownWith: 'not-downloaded',
    };

    // A thiếu s (s cũng thuộc B), đang hiện "Tải chưa xong".
    const before = service.deriveTopics(
      stages,
      makeSnapshot({
        index,
        cachedPaths: new Set([a]),
        messages: new Map([[unitA, messageA]]),
      }),
    );

    expect(before.get(unitA)).toEqual({
      status: 'not-downloaded',
      bytes: 1_300_000,
      message: 'download-incomplete',
    });
    expect(before.get(unitB)).toEqual({
      status: 'not-downloaded',
      bytes: 1_216_582,
      message: null,
    });
    expect(before.has(unitEmpty)).toBe(false);
    expect(before.has(unitMissing)).toBe(false);

    // Người học tải xong B: s có trên máy, A đủ audio mà không bấm gì trong khối của A.
    const after = service.deriveTopics(
      stages,
      makeSnapshot({
        index,
        cachedPaths: new Set([s, a, b]),
        messages: new Map([[unitA, messageA]]),
      }),
    );

    expect(after.get(unitA)).toEqual({
      status: 'downloaded',
      bytes: 1_300_000,
      canRemove: true,
      message: null,
    });
  });
});
