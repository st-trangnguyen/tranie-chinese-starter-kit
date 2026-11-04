import type { AudioJob } from '../content-build/audio';

export interface AudioPlan {
  /** Chưa có file → cần gọi TTS. */
  missing: AudioJob[];
  /** File mp3 không còn ai dùng (nội dung đã đổi) → xoá. */
  orphans: string[];
}

/**
 * Rule (S2.4 AC2): chỉ tạo file chưa có; tên theo hash nên nội dung không đổi thì không tạo lại.
 * `existing` là đường dẫn dạng `audio/<hash>.mp3` của file đang có.
 */
export function planAudio(
  jobs: readonly AudioJob[],
  existing: readonly string[],
): AudioPlan {
  const have = new Set(existing);
  const wanted = new Set(jobs.map((job) => job.path));
  return {
    missing: jobs.filter((job) => !have.has(job.path)),
    orphans: existing.filter((path) => !wanted.has(path)),
  };
}
