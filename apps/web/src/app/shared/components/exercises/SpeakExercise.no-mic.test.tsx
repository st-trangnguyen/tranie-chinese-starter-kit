import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Sentence } from '@csk/shared';

import { renderWithProviders, screen, waitFor } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import {
  createFakeStream,
  fakeAudio,
  grantMicrophone,
  installRecordingEnvironment,
  rejectGetUserMedia,
  restoreRecordingEnvironment,
  stubMediaDevices,
} from '@test/record-compare.helpers';
import { installSpeechRecognition, setOnline } from '@test/speech.helpers';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';
import { RecordingModeProvider } from '@shared/contexts/RecordingModeContext';

import { exerciseRegistry } from './exercise.registry';

const nihao = buildWord('w-nihao', '你好', 'nǐ hǎo', 'xin chào');

// Bọc RecordingModeProvider giống LessonRunnerContainer (chế độ đọc to ẩn nút Ghi âm).
function renderSpeak() {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <AudioSpeedProvider>
      <RecordingModeProvider>
        {SpeakExercise ? (
          <SpeakExercise
            exercise={{ kind: 'speak', id: 'ex-no-mic', wordId: nihao.id }}
            content={{ words: [nihao], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        ) : null}
      </RecordingModeProvider>
    </AudioSpeedProvider>,
  );
}

describe('SpeakExercise khi không có mic', () => {
  beforeEach(() => {
    installRecordingEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S5.4-AC1: ghi âm bình thường thì không hiện hướng dẫn cấp quyền', async () => {
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(
      await screen.findByRole('button', { name: 'Dừng' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/đọc to chữ trên màn/i)).not.toBeInTheDocument();
  });

  it('S5.4-AC1: quyền micro bị chặn thì hiện hướng dẫn cấp quyền và nút Thử lại', async () => {
    rejectGetUserMedia('NotAllowedError');
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Trình duyệt đang chặn micro');
    expect(alert).toHaveTextContent(/Cho phép/);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Dừng' }),
    ).not.toBeInTheDocument();
  });

  it('S5.4-AC1: hướng dẫn đọc được bằng trình đọc màn hình: role alert và focus chuyển vào hướng dẫn', async () => {
    rejectGetUserMedia('NotAllowedError');
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toBe(alert);
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });
    expect(alert.contains(document.activeElement)).toBe(true);
  });

  it('S5.4-AC1: không tìm thấy micro thì hiện hướng dẫn kiểm tra micro và nút Thử lại', async () => {
    rejectGetUserMedia('NotFoundError');
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không tìm thấy micro');
    expect(alert).toHaveTextContent(/kiểm tra micro/i);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('S5.4-AC1: trình duyệt không có mediaDevices thì báo không ghi âm được và không có nút Thử lại', async () => {
    stubMediaDevices(undefined);
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Trình duyệt này không hỗ trợ ghi âm');
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
  });

  it('S5.4-AC1: trình duyệt không có MediaRecorder thì báo không ghi âm được và không có nút Thử lại', async () => {
    vi.stubGlobal('MediaRecorder', undefined);
    const { user } = renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Trình duyệt này không hỗ trợ ghi âm');
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
  });

  it('S5.4-AC1: bấm Thử lại mà vẫn bị chặn thì vẫn hiện hướng dẫn cấp quyền và không có nút Ghi âm', async () => {
    const getUserMedia = vi.fn(() =>
      Promise.reject(
        new DOMException('microphone unavailable', 'NotAllowedError'),
      ),
    );
    stubMediaDevices({ getUserMedia });
    const { user } = renderSpeak();
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('alert');
    expect(getUserMedia).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Trình duyệt đang chặn micro');
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
  });

  it('S5.4-AC1: cấp quyền rồi bấm Thử lại thì hướng dẫn biến mất, có nút Ghi âm, focus không mất và mic không bị giữ mở', async () => {
    rejectGetUserMedia('NotAllowedError');
    const { user } = renderSpeak();
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('alert');

    const stopTrack = vi.fn();
    const stream = createFakeStream(stopTrack);
    stubMediaDevices({ getUserMedia: () => Promise.resolve(stream) });
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Thử lại' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghi âm' })).toBeInTheDocument();
    expect(stopTrack).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(document.body);
  });
});

describe('SpeakExercise chuyển chế độ khi không ghi âm được', () => {
  let uninstallSpeech: () => void;

  beforeEach(() => {
    installRecordingEnvironment();
    uninstallSpeech = installSpeechRecognition('');
    setOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    uninstallSpeech();
    restoreRecordingEnvironment();
    setOnline(true);
  });

  it('S5.4-AC2: mic bị chặn thì nhắc đọc to chữ trên màn rồi tự chấm, ẩn Ghi âm, Nghe bản ghi và Chấm tự động dù online và có SpeechRecognition', async () => {
    rejectGetUserMedia('NotAllowedError');
    const { user } = renderSpeak();
    expect(screen.getByText('Chấm tự động')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Nghe bản ghi' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
  });
});

const sentence: Sentence = {
  id: 's-xiexie',
  hanzi: '谢谢你',
  pinyin: 'xiè xie nǐ',
  vi: 'cảm ơn bạn',
  voice: 'female',
  audio: 'audio/s-xiexie00000000.mp3',
};

function renderSpeakTarget(
  exercise: { wordId: string } | { sentenceId: string },
) {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <AudioSpeedProvider>
      <RecordingModeProvider>
        {SpeakExercise ? (
          <SpeakExercise
            exercise={{ kind: 'speak', id: 'ex-no-mic-target', ...exercise }}
            content={{ words: [nihao], sentences: [sentence] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        ) : null}
      </RecordingModeProvider>
    </AudioSpeedProvider>,
  );
}

describe('SpeakExercise chế độ đọc to vẫn nghe mẫu và thấy chữ', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S5.4-AC2: prompt là từ, mic bị chặn thì Nghe mẫu bấm được và phát audio của từ, chữ Hán, pinyin, nghĩa vẫn hiện', async () => {
    const { user } = renderSpeakTarget({ wordId: nihao.id });
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    expect(screen.getByText('xin chào')).toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(nihao.audio);
    });
  });

  it('S5.4-AC2: prompt là câu, mic bị chặn thì Nghe mẫu bấm được và phát audio của câu, chữ Hán, pinyin, nghĩa vẫn hiện', async () => {
    const { user } = renderSpeakTarget({ sentenceId: sentence.id });
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(screen.getByText('xiè xie nǐ')).toBeInTheDocument();
    expect(screen.getByText('cảm ơn bạn')).toBeInTheDocument();
    const listen = screen.getByRole('button', { name: 'Nghe mẫu' });
    expect(listen).toBeEnabled();

    await user.click(listen);

    await waitFor(() => {
      expect(fakeAudio.src).toContain(sentence.audio);
    });
  });
});

describe('SpeakExercise chế độ đọc to vẫn tự đánh giá và tính điểm', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S5.4-AC2: mic bị chặn, chọn "Đúng" thì onResult được gọi đúng một lần với isCorrect true', async () => {
    const onResult = vi.fn();
    const SpeakExercise = exerciseRegistry.speak;
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <RecordingModeProvider>
          {SpeakExercise ? (
            <SpeakExercise
              exercise={{
                kind: 'speak',
                id: 'ex-no-mic-score',
                wordId: nihao.id,
              }}
              content={{ words: [nihao], sentences: [] }}
              onResult={onResult}
              isLocked={false}
            />
          ) : null}
        </RecordingModeProvider>
      </AudioSpeedProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');
    expect(onResult).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });
  it('S5.4-AC2: mic bị chặn, chọn "Chưa đúng" thì onResult báo sai kèm chữ, pinyin, nghĩa của câu mẫu', async () => {
    const onResult = vi.fn();
    const SpeakExercise = exerciseRegistry.speak;
    const { user } = renderWithProviders(
      <AudioSpeedProvider>
        <RecordingModeProvider>
          {SpeakExercise ? (
            <SpeakExercise
              exercise={{
                kind: 'speak',
                id: 'ex-no-mic-wrong',
                sentenceId: sentence.id,
              }}
              content={{ words: [nihao], sentences: [sentence] }}
              onResult={onResult}
              isLocked={false}
            />
          ) : null}
        </RecordingModeProvider>
      </AudioSpeedProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');
    expect(onResult).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Chưa đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        isCorrect: false,
        explanation: expect.stringContaining('谢谢你'),
      }),
    );
    const result = onResult.mock.calls[0]?.[0] as { explanation?: string };
    expect(result.explanation).toContain('xiè xie nǐ');
    expect(result.explanation).toContain('cảm ơn bạn');
  });
});

function speakTree(
  key: string,
  target: { wordId: string } | { sentenceId: string },
) {
  const SpeakExercise = exerciseRegistry.speak;
  return (
    <AudioSpeedProvider>
      <RecordingModeProvider>
        {SpeakExercise ? (
          <SpeakExercise
            key={key}
            exercise={{ kind: 'speak', id: `ex-${key}`, ...target }}
            content={{ words: [nihao], sentences: [sentence] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        ) : null}
      </RecordingModeProvider>
    </AudioSpeedProvider>
  );
}

describe('SpeakExercise giữ chế độ đọc to cho các câu sau', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S5.4-AC2: câu 1 mic bị chặn, câu 2 (mount lại) không có nút Ghi âm, vẫn nhắc đọc to và có Thử lại ghi âm', async () => {
    const { user, rerender } = renderWithProviders(
      speakTree('q1', { wordId: nihao.id }),
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');

    rerender(speakTree('q2', { sentenceId: sentence.id }));

    expect(screen.getByText('谢谢你')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy đọc to chữ trên màn rồi tự chọn mức bên dưới.',
    );
    expect(
      screen.getByRole('button', { name: 'Thử lại ghi âm' }),
    ).toBeInTheDocument();
  });
});

describe('SpeakExercise thử lại ghi âm từ chế độ đọc to', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  async function renderNextSentenceInReadAloud() {
    const view = renderWithProviders(speakTree('q1', { wordId: nihao.id }));
    await view.user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');
    view.rerender(speakTree('q2', { sentenceId: sentence.id }));
    await screen.findByRole('button', { name: 'Thử lại ghi âm' });
    return view;
  }

  it('S5.4-AC2: cấp lại mic rồi bấm Thử lại ghi âm thì quay về ghi âm, mất lời nhắc đọc to và focus nằm trong câu', async () => {
    const { user, container } = await renderNextSentenceInReadAloud();
    grantMicrophone();

    await user.click(screen.getByRole('button', { name: 'Thử lại ghi âm' }));

    expect(
      await screen.findByRole('button', { name: 'Ghi âm' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Nghe bản ghi' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/đọc to chữ trên màn/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thử lại ghi âm' }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(container.contains(document.activeElement)).toBe(true);
  });

  it('S5.4-AC2: mic vẫn hỏng khi bấm Thử lại ghi âm thì hiện hướng dẫn trong câu hiện tại và không có nút Ghi âm', async () => {
    const { user, container } = await renderNextSentenceInReadAloud();

    await user.click(screen.getByRole('button', { name: 'Thử lại ghi âm' }));

    const alert = await screen.findByRole('alert');
    expect(container.contains(alert)).toBe(true);
    expect(alert).toHaveTextContent('Trình duyệt đang chặn micro');
    expect(
      screen.queryByRole('button', { name: 'Ghi âm' }),
    ).not.toBeInTheDocument();
  });
});

function speakTreeForLesson(lessonKey: string) {
  const SpeakExercise = exerciseRegistry.speak;
  return (
    <AudioSpeedProvider>
      <RecordingModeProvider key={lessonKey}>
        {SpeakExercise ? (
          <SpeakExercise
            exercise={{ kind: 'speak', id: 'ex-lesson', wordId: nihao.id }}
            content={{ words: [nihao], sentences: [] }}
            onResult={vi.fn()}
            isLocked={false}
          />
        ) : null}
      </RecordingModeProvider>
    </AudioSpeedProvider>
  );
}

describe('SpeakExercise kiểm tra lại mic khi mở bài mới', () => {
  beforeEach(() => {
    installRecordingEnvironment();
    rejectGetUserMedia('NotAllowedError');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreRecordingEnvironment();
  });

  it('S5.4-AC2: đang ở chế độ đọc to, sang bài mới (provider key khác) và mic hoạt động thì có nút Ghi âm, không còn lời nhắc đọc to', async () => {
    const { user, rerender } = renderWithProviders(
      speakTreeForLesson('lesson-a'),
    );
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await screen.findByRole('status');
    grantMicrophone();

    rerender(speakTreeForLesson('lesson-b'));

    expect(
      await screen.findByRole('button', { name: 'Ghi âm' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/đọc to chữ trên màn/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Thử lại ghi âm' }),
    ).not.toBeInTheDocument();
  });
});
