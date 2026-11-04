/**
 * `pnpm --filter @csk/content content:audio` — tạo mp3 bằng edge-tts (msedge-tts, cần mạng)
 * cho mọi từ và câu chưa có file, xoá mp3 không còn dùng. Chạy sau `content:build`.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

import { planAudio } from './audioPlan';
import { assembleContent } from '../content-build/assemble';
import { VOICE_NAMES, type AudioJob } from '../content-build/audio';
import { readBuildInputs } from '../content-build/inputs';
import { PATHS, repoPath } from '../lib/paths';

const WORKERS = 4;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function synthesize(job: AudioJob): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(
      VOICE_NAMES[job.voice],
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
    );
    const { audioStream } = tts.toStream(job.text);
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}

/** Lỗi mạng/dịch vụ thì thử lại có giãn cách; hết lượt thì throw kèm chữ đang đọc. */
async function synthesizeWithRetry(job: AudioJob): Promise<Buffer> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const audio = await synthesize(job);
      if (audio.length === 0) {
        throw new Error('edge-tts trả về file rỗng');
      }
      return audio;
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) {
        throw new Error(`Không tạo được audio cho "${job.text}"`, {
          cause: error,
        });
      }
      await wait(RETRY_DELAY_MS * attempt);
    }
  }
}

async function runQueue(jobs: readonly AudioJob[]): Promise<void> {
  const queue = [...jobs];
  let done = 0;
  const worker = async (): Promise<void> => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const audio = await synthesizeWithRetry(job);
      writeFileSync(join(PATHS.assets, job.path), audio);
      done += 1;
      if (done % 50 === 0 || done === jobs.length) {
        process.stdout.write(`content:audio — ${done}/${jobs.length}\n`);
      }
    }
  };
  await Promise.all(Array.from({ length: WORKERS }, worker));
}

async function main(): Promise<void> {
  const { audioJobs } = assembleContent(readBuildInputs());
  mkdirSync(PATHS.audioOut, { recursive: true });
  const existing = readdirSync(PATHS.audioOut)
    .filter((name) => name.endsWith('.mp3'))
    .map((name) => `audio/${name}`);
  const { missing, orphans } = planAudio(audioJobs, existing);

  orphans.forEach((path) => rmSync(join(PATHS.assets, path)));
  await runQueue(missing);

  process.stdout.write(
    `content:audio — tạo ${missing.length}, xoá ${orphans.length}, ` +
      `tổng ${audioJobs.length} file trong ${repoPath(PATHS.audioOut)}\n`,
  );
}

await main();
