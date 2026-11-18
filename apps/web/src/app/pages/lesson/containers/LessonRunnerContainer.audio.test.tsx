import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '@csk/shared';

import { createDatabase } from '@core/helpers/db.helper';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { mockContentFetch, sentenceOf } from '@test/mocks/content-fetch';
import {
  fakeAudio,
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import { renderWithProviders, screen } from '@test/render';
import LessonRunnerContainer from './LessonRunnerContainer';

const word = (
  id: string,
  hanzi: string,
  pinyin: string,
  audio: string,
): Word => ({
  id,
  hanzi,
  pinyin,
  vi: [id],
  viReviewed: true,
  hsk: 1,
  audio,
});

/** Mỗi từ một file audio riêng để phân biệt câu nào đang phát. */
const BA = word('w-ba', '八', 'bā', 'audio/aaaaaaaaaaaaaaa1.mp3');
const SI = word('w-si', '四', 'sì', 'audio/bbbbbbbbbbbbbbb2.mp3');
const SHI = word('w-shi', '十', 'shì', 'audio/ccccccccccccccc3.mp3');
const MA = word('w-ma', '妈', 'mā', 'audio/ddddddddddddddd4.mp3');
const SENTENCE = sentenceOf('s-nihao');

const LESSON = {
  id: 'intro-audio',
  type: 'lesson',
  title: 'Nghe thử',
  exercises: [
    { id: 'e1', kind: 'tone-choice', wordId: BA.id },
    {
      id: 'e2',
      kind: 'sound-pair',
      wordIds: [SI.id, SHI.id],
      answerWordId: SHI.id,
    },
    { id: 'e3', kind: 'pinyin-type', wordId: MA.id },
    { id: 'e4', kind: 'speak', sentenceId: SENTENCE.id },
  ],
};

const srcOf = (audio: string): string => `/${audio}`;

const renderRunner = () =>
  renderWithProviders(
    <AudioSpeedProvider>
      <LessonRunnerContainer />
    </AudioSpeedProvider>,
    { route: '/lessons/:lessonId' },
  );

type User = ReturnType<typeof renderRunner>['user'];

const continueToNext = async (user: User): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: 'Tiếp tục' }));
};

/** Trả lời câu chọn thanh rồi sang câu kế. */
const finishToneChoice = async (user: User): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: 'Thanh 1' }));
  await continueToNext(user);
};

/** Trả lời câu cặp âm rồi sang câu kế. */
const finishSoundPair = async (user: User): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: SHI.pinyin }));
  await continueToNext(user);
};

/** Trả lời câu gõ pinyin rồi sang câu kế. */
const finishPinyinType = async (user: User): Promise<void> => {
  await user.type(
    await screen.findByRole('textbox', { name: 'Gõ pinyin của âm vừa nghe' }),
    'ma',
  );
  await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
  await continueToNext(user);
};

const clickListen = async (user: User): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: 'Nghe' }));
};

const resetSavedProgress = async (): Promise<void> => {
  const db = createDatabase();
  await db.lessonProgress.clear();
  db.close();
};

beforeEach(async () => {
  await resetSavedProgress();
  installRecordingEnvironment();
  fakeAudio.src = '';
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(
      async (input) =>
        /\/content\/lessons\/.+\.json$/.test(String(input))
          ? Response.json(LESSON)
          : new Response('', { status: 404 }),
      { words: [BA, SI, SHI, MA] },
    ),
  );
});

afterEach(() => {
  restoreRecordingEnvironment();
  vi.restoreAllMocks();
});

describe('LessonRunnerContainer — audio của câu đang hiện', () => {
  it('S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện: câu chọn thanh phát từ câu đó hỏi', async () => {
    const { user } = renderRunner();

    await clickListen(user);

    expect(fakeAudio.src).toBe(srcOf(BA.audio));
  });

  it('S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện: câu cặp âm phát từ đáp án, không phát từ câu trước', async () => {
    const { user } = renderRunner();
    await clickListen(user);
    await finishToneChoice(user);

    await clickListen(user);

    expect(fakeAudio.src).toBe(srcOf(SHI.audio));
    expect(fakeAudio.src).not.toBe(srcOf(BA.audio));
  });

  it('S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện: câu gõ pinyin phát từ câu đó hỏi, không phát từ câu trước', async () => {
    const { user } = renderRunner();
    await finishToneChoice(user);
    await clickListen(user);
    await finishSoundPair(user);

    await clickListen(user);

    expect(fakeAudio.src).toBe(srcOf(MA.audio));
    expect(fakeAudio.src).not.toBe(srcOf(SHI.audio));
  });

  it('S7.1-AC1 Nút Nghe phát đúng từ hoặc câu đang hiện: câu nói theo mẫu bấm "Nghe mẫu" phát audio của câu', async () => {
    const { user } = renderRunner();
    await finishToneChoice(user);
    await finishSoundPair(user);
    await clickListen(user);
    await finishPinyinType(user);

    await user.click(await screen.findByRole('button', { name: 'Nghe mẫu' }));

    expect(fakeAudio.src).toBe(srcOf(SENTENCE.audio));
    expect(fakeAudio.src).not.toBe(srcOf(MA.audio));
  });
});
