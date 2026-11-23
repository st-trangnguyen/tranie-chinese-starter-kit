import type { Plugin } from 'vite';

import {
  E2E_AUDIO,
  OFFLINE_AUDIO_LESSONS,
  lessonFilePath,
} from './offlineAudioFixtures';
import { MP3_FRAME_BYTES, buildSilentMp3 } from './silentMp3';

/**
 * S1.2 AC2: chỉ khi build `--mode e2e`, thêm một file nội dung và một file audio mẫu vào
 * bản build để e2e kiểm được precache khi chưa có nội dung thật (E2/E7). Bản build thường
 * không có các file này.
 */
export const OFFLINE_FIXTURE_PATHS = {
  content: 'content/_e2e/offline-lesson.json',
  audio: 'audio/_e2e/offline-silence.mp3',
} as const;

/** 40 frame im lặng: ~1 giây audio hợp lệ. */
const OFFLINE_SILENCE_BYTES = MP3_FRAME_BYTES * 40;

const OFFLINE_LESSON = {
  id: 'e2e-offline',
  title: 'Bài mẫu offline',
  audio: `/${OFFLINE_FIXTURE_PATHS.audio}`,
};

/**
 * S8.4 (design D12): thêm bài `e2e-*` và mp3 mẫu của chủ đề HSK mẫu. Bài nằm trong precache vì là
 * `.json`; mp3 mẫu không (chỉ audio Nhập môn và mp3 S1.2 được precache). Lộ trình gộp mẫu chỉ được
 * phục vụ khi có cookie fixture (`offlineAudioNetworkPlugin`), nên e2e cũ không thấy chủ đề mẫu.
 */
export const offlineFixturesPlugin = (): Plugin => ({
  name: 'csk-e2e-offline-fixtures',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: OFFLINE_FIXTURE_PATHS.content,
      source: JSON.stringify(OFFLINE_LESSON),
    });
    this.emitFile({
      type: 'asset',
      fileName: OFFLINE_FIXTURE_PATHS.audio,
      source: buildSilentMp3(OFFLINE_SILENCE_BYTES),
    });
    OFFLINE_AUDIO_LESSONS.forEach((lesson) => {
      this.emitFile({
        type: 'asset',
        fileName: lessonFilePath(lesson.id),
        source: JSON.stringify(lesson),
      });
    });
    Object.values(E2E_AUDIO).forEach((audio) => {
      this.emitFile({
        type: 'asset',
        fileName: audio.path,
        source: buildSilentMp3(audio.bytes),
      });
    });
  },
});
