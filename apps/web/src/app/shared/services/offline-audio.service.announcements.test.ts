import { describe, expect, it } from 'vitest';

import type { OfflineAudioAnnouncement } from '@shared/models/offline-audio.model';

import {
  MAX_ANNOUNCEMENTS,
  OfflineAudioService,
} from './offline-audio.service';

const GREETINGS_FINISHED: Omit<OfflineAudioAnnouncement, 'id'> = {
  kind: 'download-finished',
  unitTitle: 'Chào hỏi',
};
const FAMILY_FINISHED: Omit<OfflineAudioAnnouncement, 'id'> = {
  kind: 'download-finished',
  unitTitle: 'Gia đình',
};

const toSentence = ({ kind, unitTitle }: OfflineAudioAnnouncement): string =>
  `${kind}:${unitTitle}`;

describe('OfflineAudioService.appendAnnouncement', () => {
  const service = new OfflineAudioService();

  it('S8.4-AC1: hai chủ đề báo cùng lúc thì giữ cả câu trước lẫn câu sau', () => {
    const afterGreetings = service.appendAnnouncement([], GREETINGS_FINISHED);
    const afterFamily = service.appendAnnouncement(
      afterGreetings,
      FAMILY_FINISHED,
    );

    expect(afterFamily.map(toSentence)).toEqual([
      'download-finished:Chào hỏi',
      'download-finished:Gia đình',
    ]);
  });

  it('S8.4-AC1: câu sau có id lớn hơn câu trước', () => {
    const afterGreetings = service.appendAnnouncement([], GREETINGS_FINISHED);
    const afterFamily = service.appendAnnouncement(
      afterGreetings,
      FAMILY_FINISHED,
    );

    expect(afterFamily).toHaveLength(2);
    const [first, second] = afterFamily;
    expect(second.id).toBeGreaterThan(first.id);
  });

  it('S8.4-AC1: câu trùng chữ vẫn là phần tử mới với id khác', () => {
    const once = service.appendAnnouncement([], GREETINGS_FINISHED);
    const twice = service.appendAnnouncement(once, GREETINGS_FINISHED);

    expect(twice.map(toSentence)).toEqual([
      'download-finished:Chào hỏi',
      'download-finished:Chào hỏi',
    ]);
    expect(new Set(twice.map(({ id }) => id)).size).toBe(2);
  });

  it('S8.4-AC1: quá MAX_ANNOUNCEMENTS thì bỏ câu cũ nhất', () => {
    expect(MAX_ANNOUNCEMENTS).toBe(5);
    const titles = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu'];

    const list = titles.reduce<readonly OfflineAudioAnnouncement[]>(
      (acc, unitTitle) =>
        service.appendAnnouncement(acc, {
          kind: 'download-started',
          unitTitle,
        }),
      [],
    );

    expect(list.map(({ unitTitle }) => unitTitle)).toEqual([
      'Hai',
      'Ba',
      'Bốn',
      'Năm',
      'Sáu',
    ]);
    const ids = list.map(({ id }) => id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
    expect(new Set(ids).size).toBe(MAX_ANNOUNCEMENTS);
  });

  it('S8.4-AC1: không sửa danh sách đầu vào', () => {
    const before = service.appendAnnouncement([], GREETINGS_FINISHED);
    const snapshot = [...before];

    const after = service.appendAnnouncement(before, FAMILY_FINISHED);

    expect(before).toEqual(snapshot);
    expect(after).not.toBe(before);
    expect(after).toHaveLength(2);
  });
});
