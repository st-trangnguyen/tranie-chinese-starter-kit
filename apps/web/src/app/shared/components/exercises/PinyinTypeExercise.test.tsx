import { describe, expect, it, vi } from 'vitest';

import type { Word } from '@csk/shared';

import { renderWithProviders, screen } from '@test/render';
import { AudioSpeedProvider } from '@shared/contexts/AudioSpeedContext';

import { PinyinTypeExercise } from './PinyinTypeExercise';

const word: Word = {
  id: 'w-ni',
  hanzi: '你',
  pinyin: 'nǐ',
  vi: ['bạn'],
  viReviewed: true,
  hsk: 1,
  audio: 'audio/0123456789abcdef.mp3',
};

function renderExercise() {
  return renderWithProviders(
    <AudioSpeedProvider>
      <PinyinTypeExercise
        exercise={{ id: 'ex-1', kind: 'pinyin-type', wordId: 'w-ni' }}
        content={{ words: [word], sentences: [] }}
        onResult={vi.fn()}
        isLocked={false}
      />
    </AudioSpeedProvider>,
  );
}

describe('PinyinTypeExercise', () => {
  it.each([
    { scenario: 'Gõ ni3 thì hiện nǐ', typed: 'ni3', shown: 'nǐ' },
    {
      scenario: 'Gõ liền nhiều âm tiết thì đổi từng âm tiết',
      typed: 'ni3hao3',
      shown: 'nǐhǎo',
    },
    { scenario: 'Gõ v thay cho ü', typed: 'lv4', shown: 'lǜ' },
    { scenario: 'Số 5 là thanh nhẹ', typed: 'ma5', shown: 'ma' },
    {
      scenario: 'Số đứng sai chỗ thì giữ nguyên',
      typed: '3',
      shown: '3',
    },
  ])('S4.3-AC1: $scenario ($typed → $shown)', async ({ typed, shown }) => {
    const { user } = renderExercise();

    const input = screen.getByLabelText('Gõ pinyin của âm vừa nghe');
    await user.type(input, typed);

    expect(input).toHaveValue(shown);
  });
});

interface GradingOptions {
  pinyin: string;
  isLocked?: boolean;
}

function renderForGrading({ pinyin, isLocked = false }: GradingOptions) {
  const onResult = vi.fn();
  const target: Word = { ...word, pinyin };
  const view = renderWithProviders(
    <AudioSpeedProvider>
      <PinyinTypeExercise
        exercise={{ id: 'ex-1', kind: 'pinyin-type', wordId: 'w-ni' }}
        content={{ words: [target], sentences: [] }}
        onResult={onResult}
        isLocked={isLocked}
      />
    </AudioSpeedProvider>,
  );
  return { ...view, onResult };
}

const inputLabel = 'Gõ pinyin của âm vừa nghe';

describe('PinyinTypeExercise chấm bài', () => {
  it.each([
    {
      scenario: 'Gõ kiểu số đúng thì được chấm đúng',
      pinyin: 'nǐ',
      typed: 'ni3',
    },
    {
      scenario: 'Gõ kiểu dấu đúng thì được chấm đúng',
      pinyin: 'nǐ',
      typed: 'nǐ',
    },
    {
      scenario: 'Gõ liền hay cách âm tiết đều đúng',
      pinyin: 'bàba',
      typed: 'ba4ba',
    },
    {
      scenario: 'Gõ liền hay cách âm tiết đều đúng',
      pinyin: 'bàba',
      typed: 'ba4ba5',
    },
    {
      scenario: 'Gõ liền hay cách âm tiết đều đúng',
      pinyin: 'bàba',
      typed: 'ba4 ba',
    },
  ])(
    'S4.3-AC2: $scenario ($pinyin ← $typed, bấm Kiểm tra)',
    async ({ pinyin, typed }) => {
      const { user, onResult } = renderForGrading({ pinyin });

      await user.type(screen.getByLabelText(inputLabel), typed);
      await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

      expect(onResult).toHaveBeenCalledTimes(1);
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ isCorrect: true }),
      );
    },
  );

  it('S4.3-AC2: Hoa thường và khoảng trắng thừa không ảnh hưởng (Enter)', async () => {
    const { user, onResult } = renderForGrading({ pinyin: 'nǐ hǎo' });

    await user.type(screen.getByLabelText(inputLabel), '  Ni3  Hao3 {Enter}');

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ isCorrect: true }),
    );
  });

  it('S4.3-AC2: Ô trống thì chưa chấm và ô vẫn nhập được', async () => {
    const { user, onResult } = renderForGrading({ pinyin: 'nǐ' });
    const input = screen.getByLabelText(inputLabel);

    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(onResult).not.toHaveBeenCalled();
    expect(input).toBeEnabled();

    await user.type(input, 'ni3');
    expect(input).toHaveValue('nǐ');
  });

  it('S4.3-AC2: Chấm xong thì khóa ô nhập và nút, onResult chỉ một lần', async () => {
    const { user, onResult } = renderForGrading({ pinyin: 'nǐ' });
    const input = screen.getByLabelText(inputLabel);
    const button = screen.getByRole('button', { name: 'Kiểm tra' });

    await user.type(input, 'ni3');
    await user.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();

    await user.type(input, 'x');
    await user.click(button);

    expect(input).toHaveValue('nǐ');
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('S4.3-AC2: Chấm xong thì khóa ô nhập, isLocked chặn việc chấm', async () => {
    const { user, onResult } = renderForGrading({
      pinyin: 'nǐ',
      isLocked: true,
    });

    await user.type(screen.getByLabelText(inputLabel), 'ni3{Enter}');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(onResult).not.toHaveBeenCalled();
  });

  it('S4.3-AC2: Trước khi chấm không có pinyin đúng trong DOM', async () => {
    const { user, container } = renderForGrading({ pinyin: 'nǐ hǎo' });

    expect(container.innerHTML).not.toContain('nǐ hǎo');
    expect(container.innerHTML).not.toContain('nǐhǎo');

    await user.type(screen.getByLabelText(inputLabel), 'ni3');

    expect(container.innerHTML).not.toContain('nǐ hǎo');
    expect(screen.queryByText('Pinyin đúng')).not.toBeInTheDocument();
  });

  it('S4.3-AC2: Sau khi chấm hiện khối Pinyin đúng', async () => {
    const { user } = renderForGrading({ pinyin: 'nǐ hǎo' });

    await user.type(screen.getByLabelText(inputLabel), 'ni3hao3{Enter}');

    expect(screen.getByText('Pinyin đúng')).toBeInTheDocument();
  });
});

function countLabels(): Record<'Thanh mẫu' | 'Vận mẫu' | 'Thanh điệu', number> {
  return {
    'Thanh mẫu': screen.queryAllByText('Thanh mẫu').length,
    'Vận mẫu': screen.queryAllByText('Vận mẫu').length,
    'Thanh điệu': screen.queryAllByText('Thanh điệu').length,
  };
}

describe('PinyinTypeExercise tô chỗ sai', () => {
  it.each([
    {
      scenario: 'Sai thanh mẫu',
      pinyin: 'shì',
      typed: 'si4',
      expected: { 'Thanh mẫu': 1, 'Vận mẫu': 0, 'Thanh điệu': 0 },
    },
    {
      scenario: 'Sai vận mẫu',
      pinyin: 'nǐ',
      typed: 'na3',
      expected: { 'Thanh mẫu': 0, 'Vận mẫu': 1, 'Thanh điệu': 0 },
    },
    {
      scenario: 'Sai thanh điệu',
      pinyin: 'mā',
      typed: 'ma2',
      expected: { 'Thanh mẫu': 0, 'Vận mẫu': 0, 'Thanh điệu': 1 },
    },
    {
      scenario: 'Sai nhiều phần thì tô hết các phần sai',
      pinyin: 'mā',
      typed: 'na2',
      expected: { 'Thanh mẫu': 1, 'Vận mẫu': 0, 'Thanh điệu': 1 },
    },
    {
      scenario: 'Từ nhiều âm tiết thì tô theo từng âm tiết',
      pinyin: 'nǐ hǎo',
      typed: 'ni3hao2',
      expected: { 'Thanh mẫu': 0, 'Vận mẫu': 0, 'Thanh điệu': 1 },
    },
    {
      scenario: 'Thiếu âm tiết thì âm tiết thiếu bị tô sai ở cả ba phần',
      pinyin: 'nǐ hǎo',
      typed: 'ni3',
      expected: { 'Thanh mẫu': 1, 'Vận mẫu': 1, 'Thanh điệu': 1 },
    },
  ])(
    'S4.3-AC3: $scenario ($pinyin ← $typed)',
    async ({ pinyin, typed, expected }) => {
      const { user, onResult } = renderForGrading({ pinyin });

      await user.type(screen.getByLabelText(inputLabel), typed);
      await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ isCorrect: false }),
      );
      expect(countLabels()).toEqual(expected);
    },
  );

  it('S4.3-AC3: Phần sai có nhãn chữ, explanation và pinyin đúng', async () => {
    const { user, onResult } = renderForGrading({ pinyin: 'mā' });

    await user.type(screen.getByLabelText(inputLabel), 'na2');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(onResult).toHaveBeenCalledWith({
      isCorrect: false,
      explanation: 'Đáp án đúng: mā',
    });
    expect(screen.getByText('Pinyin đúng')).toBeInTheDocument();
    expect(screen.getByText('mā')).toBeInTheDocument();
    expect(screen.getByText('Thanh mẫu')).toBeInTheDocument();
    expect(screen.getByText('Thanh điệu')).toBeInTheDocument();
  });

  it('S4.3-AC3: Gõ đúng thì không có nhãn phần sai và không có explanation', async () => {
    const { user, onResult } = renderForGrading({ pinyin: 'mā' });

    await user.type(screen.getByLabelText(inputLabel), 'ma1');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(onResult).toHaveBeenCalledWith({ isCorrect: true });
    expect(countLabels()).toEqual({
      'Thanh mẫu': 0,
      'Vận mẫu': 0,
      'Thanh điệu': 0,
    });
  });
});
