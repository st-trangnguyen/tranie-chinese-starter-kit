import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders, screen, within } from '@test/render';
import { buildWord } from '@test/sound-pair.fixtures';
import {
  installRecordingEnvironment,
  restoreRecordingEnvironment,
} from '@test/record-compare.helpers';
import {
  FakeSpeechRecognition,
  installSpeechRecognition,
  setOnline,
} from '@test/speech.helpers';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { exerciseRegistry } from './exercise.registry';

const nihao = buildWord('w-nihao', '你好', 'nǐ hǎo', 'xin chào');

const nihaoma = buildWord('w-nihaoma', '你好吗', 'nǐ hǎo ma', 'bạn khỏe không');

function renderSpeak(word = nihao, onResult = vi.fn()) {
  const SpeakExercise = exerciseRegistry.speak;
  return renderWithProviders(
    <AudioSpeedProvider>
      {SpeakExercise ? (
        <SpeakExercise
          exercise={{ kind: 'speak', id: 'ex-auto', wordId: word.id }}
          content={{ words: [word], sentences: [] }}
          onResult={onResult}
          isLocked={false}
        />
      ) : null}
    </AudioSpeedProvider>,
  );
}

describe('SpeakExercise chấm tự động', () => {
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

  it('S5.3-AC1: có mạng và trình duyệt hỗ trợ thì hiện khu "Chấm tự động"', () => {
    renderSpeak();

    expect(screen.getByText('Chấm tự động')).toBeInTheDocument();
  });

  it('S5.3-AC1: trình duyệt không hỗ trợ SpeechRecognition thì ẩn khu "Chấm tự động"', () => {
    uninstallSpeech();
    expect(Reflect.get(window, 'SpeechRecognition')).toBeUndefined();
    expect(Reflect.get(window, 'webkitSpeechRecognition')).toBeUndefined();
    renderSpeak();

    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
  });

  it('S5.3-AC1: không có mạng thì không có khu "Chấm tự động"', () => {
    setOnline(false);
    renderSpeak();

    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
  });

  it('S5.3-AC1: mất mạng giữa chừng thì ẩn khu "Chấm tự động"', () => {
    renderSpeak();
    expect(screen.getByText('Chấm tự động')).toBeInTheDocument();

    act(() => {
      setOnline(false);
    });

    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
  });

  it('S5.3-AC1: có mạng lại thì khu "Chấm tự động" hiện lại', () => {
    setOnline(false);
    renderSpeak();
    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();

    act(() => {
      setOnline(true);
    });

    expect(screen.getByText('Chấm tự động')).toBeInTheDocument();
  });

  it('S5.3-AC1: chưa ghi âm thì khu "Chấm tự động" chưa có kết quả', () => {
    renderSpeak();

    expect(screen.getByText('Chấm tự động')).toBeInTheDocument();
    expect(screen.queryByText(/Khớp với câu đúng/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Máy không nghe được/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('你好', { selector: '.auto-check *' }),
    ).not.toBeInTheDocument();
  });

  it('S5.3-AC2: nhận được đúng hết thì hiện câu nghe được và "Khớp với câu đúng"', async () => {
    FakeSpeechRecognition.transcript = '你好';
    const user = userEvent.setup();
    renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(await screen.findByText('Khớp với câu đúng')).toBeInTheDocument();
    const heard = screen.getAllByText('你好', { selector: '.auto-check *' });
    expect(heard.length).toBeGreaterThan(0);
    expect(screen.queryByText('Khác')).not.toBeInTheDocument();
    expect(screen.queryByText('Thiếu')).not.toBeInTheDocument();
    expect(screen.queryByText('Thừa')).not.toBeInTheDocument();
  });

  it('S5.3-AC2: câu đúng "你好！", máy nhận "你 好" thì không tô chỗ nào và báo khớp', async () => {
    FakeSpeechRecognition.transcript = '你 好';
    const user = userEvent.setup();
    renderSpeak(buildWord('w-nihao-punct', '你好！', 'nǐ hǎo', 'xin chào'));

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(await screen.findByText('Khớp với câu đúng')).toBeInTheDocument();
    expect(screen.queryByText('Khác')).not.toBeInTheDocument();
    expect(screen.queryByText('Thiếu')).not.toBeInTheDocument();
    expect(screen.queryByText('Thừa')).not.toBeInTheDocument();
  });

  it('S5.3-AC2: nhận được một chữ khác thì nhãn "Khác" nằm trong chữ tô, chữ khớp không có nhãn', async () => {
    FakeSpeechRecognition.transcript = '你号';
    const user = userEvent.setup();
    renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    const label = await screen.findByText('Khác');
    const differentChar = label.closest('.auto-check-char');
    expect(differentChar).not.toBeNull();
    expect(differentChar).toHaveTextContent('号');
    expect(differentChar).not.toHaveTextContent('你');

    const sameChar = screen.getByText('你', { selector: '.auto-check-char' });
    expect(sameChar).not.toHaveTextContent('Khác');
    expect(screen.getAllByText('Khác')).toHaveLength(1);
    expect(screen.queryByText('Khớp với câu đúng')).not.toBeInTheDocument();
  });

  it('S5.3-AC2: máy nhận thiếu chữ thì nhãn "Thiếu" nằm trong chữ của câu đúng', async () => {
    FakeSpeechRecognition.transcript = '你好';
    const user = userEvent.setup();
    renderSpeak(nihaoma);

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    const label = await screen.findByText('Thiếu');
    const missingChar = label.closest('.auto-check-char');
    expect(missingChar).not.toBeNull();
    expect(missingChar).toHaveTextContent('吗');
    expect(missingChar).not.toHaveTextContent('你');
    expect(screen.getAllByText('Thiếu')).toHaveLength(1);
    expect(screen.queryByText('Khớp với câu đúng')).not.toBeInTheDocument();
  });

  it('S5.3-AC2: máy nhận thừa chữ thì nhãn "Thừa" nằm trong chữ máy nghe được', async () => {
    FakeSpeechRecognition.transcript = '你好吗';
    const user = userEvent.setup();
    renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    const label = await screen.findByText('Thừa');
    const extraChar = label.closest('.auto-check-char');
    expect(extraChar).not.toBeNull();
    expect(extraChar).toHaveTextContent('吗');
    expect(extraChar).not.toHaveTextContent('你');
    expect(screen.getAllByText('Thừa')).toHaveLength(1);
    expect(screen.queryByText('Khớp với câu đúng')).not.toBeInTheDocument();
  });

  it.each([
    { name: 'rỗng', heard: '' },
    { name: 'chỉ có dấu câu và khoảng trắng', heard: ' 。！, ' },
  ])(
    'S5.3-AC2: máy nhận được chữ $name thì báo không nghe được và không tô chữ nào',
    async ({ heard }) => {
      FakeSpeechRecognition.transcript = heard;
      const user = userEvent.setup();
      const { container } = renderSpeak();

      await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
      await user.click(screen.getByRole('button', { name: 'Dừng' }));

      expect(
        await screen.findByText('Máy không nghe được, hãy thử lại'),
      ).toBeInTheDocument();
      expect(container.querySelector('.auto-check-char')).toBeNull();
      expect(screen.queryByText('Khác')).not.toBeInTheDocument();
      expect(screen.queryByText('Thiếu')).not.toBeInTheDocument();
      expect(screen.queryByText('Thừa')).not.toBeInTheDocument();
      expect(screen.queryByText('Khớp với câu đúng')).not.toBeInTheDocument();
    },
  );

  it('S5.3-AC2: ghi âm lại thì khu chỉ hiện kết quả của lần mới, không còn nhãn lần cũ', async () => {
    FakeSpeechRecognition.transcript = '你号';
    const user = userEvent.setup();
    renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(await screen.findByText('Khác')).toBeInTheDocument();

    FakeSpeechRecognition.transcript = '你好';
    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(await screen.findByText('Khớp với câu đúng')).toBeInTheDocument();
    expect(screen.queryByText('Khác')).not.toBeInTheDocument();
    expect(
      screen.queryByText('号', { selector: '.auto-check *' }),
    ).not.toBeInTheDocument();
  });

  it('S5.3-AC2: vừa bấm ghi âm lại thì kết quả của lần cũ không còn hiện trong lúc ghi', async () => {
    FakeSpeechRecognition.transcript = '你号';
    const user = userEvent.setup();
    renderSpeak();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(await screen.findByText('Khác')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));

    expect(screen.queryByText('Khác')).not.toBeInTheDocument();
  });

  it.each([
    { label: 'Khác', expected: '你好', heard: '你号', char: '号' },
    { label: 'Thiếu', expected: '你好吗', heard: '你好', char: '吗' },
    { label: 'Thừa', expected: '你好', heard: '你好吗', char: '吗' },
  ])(
    'S5.3-AC2: chỗ tô có nhãn chữ "$label" đọc được, không chỉ báo bằng màu',
    async ({ label, expected, heard, char }) => {
      FakeSpeechRecognition.transcript = heard;
      const user = userEvent.setup();
      renderSpeak(buildWord('w-label', expected, 'nǐ hǎo', 'xin chào'));

      await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
      await user.click(screen.getByRole('button', { name: 'Dừng' }));

      const labelNode = await screen.findByText(label);
      expect(labelNode).toBeVisible();
      expect(labelNode.closest('[aria-hidden="true"]')).toBeNull();
      expect(labelNode.textContent?.trim()).toBe(label);

      const highlighted = labelNode.closest('.auto-check-char');
      expect(highlighted).not.toBeNull();
      expect(highlighted).toHaveTextContent(char);
      expect(highlighted).toHaveTextContent(label);
    },
  );

  it('S5.3-AC2: máy nhận khớp hoàn toàn thì không tự chọn mức, onResult chưa được gọi và 3 nút vẫn bật', async () => {
    FakeSpeechRecognition.transcript = '你好';
    const onResult = vi.fn();
    const user = userEvent.setup();
    renderSpeak(nihao, onResult);

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(await screen.findByText('Khớp với câu đúng')).toBeInTheDocument();

    expect(onResult).not.toHaveBeenCalled();
    const group = screen.getByRole('group', { name: 'Tự đánh giá phát âm' });
    const buttons = within(group).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Chưa đúng',
      'Gần đúng',
      'Đúng',
    ]);
    buttons.forEach((button) => {
      expect(button).toBeEnabled();
      expect(button).not.toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('S5.3-AC3: không hỗ trợ SpeechRecognition vẫn ghi âm, nghe lại và tự đánh giá "Đúng" được', async () => {
    uninstallSpeech();
    // uninstallSpeech gỡ mọi stub toàn cục, kể cả MediaRecorder: dựng lại micro giả.
    installRecordingEnvironment();
    expect(Reflect.get(window, 'SpeechRecognition')).toBeUndefined();
    expect(Reflect.get(window, 'webkitSpeechRecognition')).toBeUndefined();
    const onResult = vi.fn();
    const user = userEvent.setup();
    renderSpeak(nihao, onResult);

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(
      await screen.findByRole('button', { name: 'Nghe bản ghi' }),
    ).toBeEnabled();
    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });

  it('S5.3-AC3: offline vẫn ghi âm, nghe lại và tự đánh giá "Gần đúng" được, không chạy nhận dạng', async () => {
    // SpeechRecognition vẫn được hỗ trợ (đã cài ở beforeEach), chỉ mất mạng.
    setOnline(false);
    const startSpy = vi.spyOn(FakeSpeechRecognition.prototype, 'start');
    const onResult = vi.fn();
    const user = userEvent.setup();
    renderSpeak(nihao, onResult);

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(
      await screen.findByRole('button', { name: 'Nghe bản ghi' }),
    ).toBeEnabled();
    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
    expect(startSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Gần đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: false }),
    );
  });

  it('S5.3-AC3: nhận diện lỗi network giữa chừng thì ẩn khu "Chấm tự động", vẫn nghe lại và tự đánh giá được', async () => {
    vi.spyOn(FakeSpeechRecognition.prototype, 'stop').mockImplementation(
      function stopWithNetworkError(this: FakeSpeechRecognition): void {
        this.emitError('network');
      },
    );
    const onResult = vi.fn();
    const user = userEvent.setup();
    const { container } = renderSpeak(nihao, onResult);

    await user.click(screen.getByRole('button', { name: 'Ghi âm' }));
    await user.click(screen.getByRole('button', { name: 'Dừng' }));

    expect(
      await screen.findByRole('button', { name: 'Nghe bản ghi' }),
    ).toBeEnabled();
    expect(screen.queryByText('Chấm tự động')).not.toBeInTheDocument();
    expect(container.querySelector('.auto-check')).toBeNull();
    expect(container.querySelector('.auto-check-char')).toBeNull();
    expect(screen.queryByText('Khớp với câu đúng')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Máy không nghe được, hãy thử lại'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đúng' }));

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });
});
