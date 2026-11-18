/** Lộ trình nhiều nhóm, giai đoạn thay qua page.route cho e2e S8.1 (design mục Test). */
import type { Page, Route } from '@playwright/test';

import { INTRO_LESSON_IDS } from '../E7/intro-lessons.helpers';

const introLessonId = (index: number): string => INTRO_LESSON_IDS[index] ?? '';

/**
 * Lộ trình 2 giai đoạn dựng từ bài Nhập môn thật: giai đoạn 1 có nhóm A (bài 1, 2, 3) và nhóm B
 * (bài 4, 5); giai đoạn 2 có nhóm C (bài 6, 7).
 */
const MULTI_UNIT_CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [
        {
          id: 'unit-a',
          title: 'Nhóm A',
          lessonIds: [introLessonId(0), introLessonId(1), introLessonId(2)],
        },
        {
          id: 'unit-b',
          title: 'Nhóm B',
          lessonIds: [introLessonId(3), introLessonId(4)],
        },
      ],
    },
    {
      id: 'stage-2',
      title: 'Giai đoạn 2',
      units: [
        {
          id: 'unit-c',
          title: 'Nhóm C',
          lessonIds: [introLessonId(5), introLessonId(6)],
        },
      ],
    },
  ],
};

/**
 * Thay nội dung bằng lộ trình nhiều nhóm, mỗi bài trong `testLessonIds` đổi `type` thành `test`
 * (bài kiểm tra cuối chủ đề). Cần `serviceWorkers: 'block'`: page.route không chặn request do
 * service worker phục vụ.
 */
export const serveMultiUnitPath = async (
  page: Page,
  testLessonIds: readonly string[],
): Promise<void> => {
  await page.route('**/content/content.json', (route: Route) =>
    route.fulfill({ json: MULTI_UNIT_CONTENT_ROOT }),
  );
  for (const testLessonId of testLessonIds) {
    await page.route(
      `**/content/lessons/${testLessonId}.json`,
      async (route) => {
        const response = await route.fetch();
        const lesson: unknown = await response.json();
        const json =
          typeof lesson === 'object' && lesson !== null
            ? { ...lesson, type: 'test' }
            : lesson;
        await route.fulfill({ response, json });
      },
    );
  }
};
