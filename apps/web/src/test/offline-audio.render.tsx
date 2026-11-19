// Render màn Lộ trình với service audio offline thật trên adapter giả (S8.4, container).
// Chỉ thay ranh giới ngoài: `fetch` nội dung (content.json, bài), Cache Storage + mạng (`FakeAudioCache`)
// và audio index (`fakeContentSourceWithIndex`).

import type { AudioIndex } from '@csk/shared';

import LearningPathContainer from '@app/pages/learning-path/containers/LearningPathContainer';
import { OfflineAudioServiceContext } from '@shared/contexts/useOfflineAudioService';
import { OfflineAudioService } from '@shared/services/offline-audio.service';

import {
  FakeAudioCache,
  fakeContentSourceWithIndex,
} from './offline-audio.fakes';
import {
  HSK_INDEX,
  HSK_STAGE_ID,
  HSK_UNIT_2_ID,
  HSK_UNIT_ID,
} from './offline-audio.fixtures';
import { renderWithProviders } from './render';

export interface PathUnit {
  id: string;
  title: string;
  lessonIds: string[];
}

export interface PathStage {
  id: string;
  title: string;
  units: PathUnit[];
}

/** Id chủ đề Nhập môn khớp `HSK_INDEX.units.intro1`. */
export const INTRO_UNIT_ID = 'intro1';

/**
 * Lộ trình mặc định: nhóm Nhập môn (có audio Nhập môn) rồi giai đoạn HSK 1 với "Chào hỏi"
 * (4 file, 2 516 582 byte) và "Gia đình". Id khớp `offline-audio.fixtures.ts`.
 */
export const OFFLINE_AUDIO_STAGES: readonly PathStage[] = [
  {
    id: 'intro',
    title: 'Nhập môn',
    units: [{ id: INTRO_UNIT_ID, title: 'Phát âm', lessonIds: ['l1'] }],
  },
  {
    id: HSK_STAGE_ID,
    title: 'HSK 1',
    units: [
      { id: HSK_UNIT_ID, title: 'Chào hỏi', lessonIds: ['l2'] },
      { id: HSK_UNIT_2_ID, title: 'Gia đình', lessonIds: ['l3'] },
    ],
  },
];

/** `fetch` giả trả content.json với `stages`; bài có id trong `testLessonIds` là bài `test`. */
export function mockPathContent(
  stages: readonly PathStage[] = OFFLINE_AUDIO_STAGES,
  testLessonIds: readonly string[] = [],
): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    if (url === '/content/content.json') {
      return Response.json({ contentVersion: '0123456789ab', stages });
    }
    const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
    return Response.json({
      id: lessonId,
      type: testLessonIds.includes(lessonId) ? 'test' : 'lesson',
      title: `Bài ${lessonId}`,
      exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
    });
  });
}

interface RenderPathOptions {
  /** File audio đã có trên máy lúc mở màn. */
  cached?: readonly string[];
  index?: AudioIndex;
}

/** Render `LearningPathContainer` ở `/learning-paths` với `OfflineAudioService` riêng của test. */
export function renderPathWithOfflineAudio({
  cached = [],
  index = HSK_INDEX,
}: RenderPathOptions = {}) {
  const cache = new FakeAudioCache(cached);
  const service = new OfflineAudioService(
    cache,
    fakeContentSourceWithIndex(index),
  );
  const rendered = renderWithProviders(
    <OfflineAudioServiceContext value={service}>
      <LearningPathContainer />
    </OfflineAudioServiceContext>,
    { route: '/learning-paths' },
  );
  return { ...rendered, cache, service };
}
