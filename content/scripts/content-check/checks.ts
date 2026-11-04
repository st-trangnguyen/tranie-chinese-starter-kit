import { isToneMarkedPinyin } from '@csk/shared';

import type { ContentCheck, ContentIssue } from './checkRunner';
import type { AudioJob } from '../content-build/audio';
import type { OutputDiff } from '../content-build/output';
import type { HskEntry } from '../content-fetch/hskList';
import type { ViMeanings } from '../lib/authored.schema';

/** Số từ HSK 3.0 cấp 1 theo chuẩn 2021 (S2.1 AC1). */
export const HSK1_WORD_COUNT = 500;

const listed = (items: readonly string[]): string => items.join(', ');

/** S2.1: đủ 500 từ, mọi từ có pinyin có dấu. */
export function hskWordsCheck(
  file: string,
  entries: readonly HskEntry[],
): ContentCheck {
  return {
    name: 'hsk-words',
    run: () => {
      const count: ContentIssue[] =
        entries.length === HSK1_WORD_COUNT
          ? []
          : [
              {
                level: 'error',
                file,
                message: `Danh sách HSK 1 có ${entries.length} từ, cần ${HSK1_WORD_COUNT}`,
              },
            ];
      const badPinyin = entries.filter(
        (entry) => !isToneMarkedPinyin(entry.pinyin),
      );
      const pinyin: ContentIssue[] = badPinyin.map((entry) => ({
        level: 'error',
        file,
        message: `Từ "${entry.id}" thiếu pinyin có dấu (đang là "${entry.pinyin}")`,
      }));
      return [...count, ...pinyin];
    },
  };
}

/** S2.2: từ chưa có nghĩa hoặc chưa review → cảnh báo kèm danh sách. */
export function viMeaningsCheck(
  file: string,
  entries: readonly HskEntry[],
  meanings: ViMeanings,
): ContentCheck {
  return {
    name: 'vi-meanings',
    run: () => {
      const noMeaning = entries
        .filter((entry) => (meanings[entry.id]?.vi.length ?? 0) === 0)
        .map((entry) => entry.id);
      const unreviewed = entries
        .filter((entry) => meanings[entry.id]?.reviewed !== true)
        .map((entry) => entry.id);
      const known = new Set(entries.map((entry) => entry.id));
      const unknown = Object.keys(meanings).filter((id) => !known.has(id));
      const warn = (message: string): ContentIssue => ({
        level: 'warning',
        file,
        message,
      });
      return [
        ...(noMeaning.length > 0
          ? [
              warn(
                `${noMeaning.length} từ chưa có nghĩa tiếng Việt: ${listed(noMeaning)}`,
              ),
            ]
          : []),
        ...(unreviewed.length > 0
          ? [
              warn(
                `${unreviewed.length} từ chưa review nghĩa: ${listed(unreviewed)}`,
              ),
            ]
          : []),
        ...(unknown.length > 0
          ? [warn(`ID không có trong danh sách HSK: ${listed(unknown)}`)]
          : []),
      ];
    },
  };
}

/** S2.3: lỗi schema / tham chiếu của bài YAML (đã kèm file và dòng). */
export function lessonsCheck(issues: readonly ContentIssue[]): ContentCheck {
  return { name: 'lessons', run: () => [...issues] };
}

/** S2.4: mỗi từ và câu phải có mp3 đúng hash. */
export function audioCheck(
  dir: string,
  jobs: readonly AudioJob[],
  hasFile: (path: string) => boolean,
): ContentCheck {
  return {
    name: 'audio',
    run: () => {
      const missing = jobs.filter((job) => !hasFile(job.path));
      return missing.length === 0
        ? []
        : [
            {
              level: 'error',
              file: dir,
              message:
                `${missing.length} audio chưa tạo — chạy \`pnpm --filter @csk/content content:audio\`: ` +
                listed(missing.map((job) => job.text)),
            },
          ];
    },
  };
}

/** S2.5 AC2: chữ có trong bài mà không có dữ liệu nét → cảnh báo. */
export function strokesCheck(
  file: string,
  missingChars: readonly string[],
): ContentCheck {
  return {
    name: 'strokes',
    run: () =>
      missingChars.length === 0
        ? []
        : [
            {
              level: 'warning',
              file,
              message: `${missingChars.length} chữ không có dữ liệu nét hanzi-writer: ${listed(missingChars)}`,
            },
          ],
  };
}

/** JSON trong assets phải khớp kết quả build từ nguồn hiện tại. */
export function outputInSyncCheck(dir: string, diff: OutputDiff): ContentCheck {
  return {
    name: 'output-in-sync',
    run: () => {
      const changed = [...diff.stale, ...diff.extra];
      return changed.length === 0
        ? []
        : [
            {
              level: 'error',
              file: dir,
              message:
                'Output chưa khớp nguồn — chạy `pnpm --filter @csk/content content:build`: ' +
                listed(changed),
            },
          ];
    },
  };
}
