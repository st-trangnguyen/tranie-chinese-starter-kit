import { screen, within } from '@test/render';
import {
  failInAct,
  mockPathContent,
  releaseInAct,
  renderPathWithOfflineAudio,
} from '@test/offline-audio.render';
import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_D,
  AUDIO_E,
  HSK_TWO_UNITS_INDEX,
} from '@test/offline-audio.fixtures';

const DOWNLOAD_NAME = 'Tải audio (2,4 MB), chủ đề Chào hỏi';
const REMOVE_NAME = 'Xóa audio, chủ đề Chào hỏi';
const ANNOUNCER_NAME = 'Thông báo audio offline';
const FINISHED_GREETINGS = 'Đã tải xong audio chủ đề Chào hỏi.';
const FINISHED_FAMILY = 'Đã tải xong audio chủ đề Gia đình.';
const DOWNLOAD_INCOMPLETE = 'Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.';
const MAX_TAB_STEPS = 30;

const findUnitSection = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByRole('heading', { level: 3, name: title });
  const section = heading.closest('section');
  if (!section) {
    throw new Error(`Không tìm thấy khối của chủ đề "${title}"`);
  }
  return section;
};

const findButtonByVisibleText = async (
  unit: HTMLElement,
  text: string,
): Promise<HTMLElement> => {
  const label = await within(unit).findByText(text);
  const button = label.closest('button');
  if (!button) {
    throw new Error(`Không tìm thấy nút "${text}"`);
  }
  return button;
};

beforeEach(() => {
  mockPathContent();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LearningPathContainer — audio offline: tên nút cho trình đọc màn hình', () => {
  it('S8.4-AC1 Nút tải có tên kèm chủ đề: should name the download button "Tải audio (2,4 MB), chủ đề Chào hỏi", starting with its visible text', async () => {
    renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const button = await findButtonByVisibleText(unit, 'Tải audio (2,4 MB)');

    expect(button).toHaveAccessibleName(DOWNLOAD_NAME);
    expect(within(unit).getByRole('button', { name: DOWNLOAD_NAME })).toBe(
      button,
    );
    const visibleText = button.textContent ?? '';
    expect(visibleText).not.toBe('');
    expect(DOWNLOAD_NAME.startsWith(visibleText)).toBe(true);
  });

  it('S8.4-AC2 Nút xóa có tên kèm chủ đề: should name the remove button "Xóa audio, chủ đề Chào hỏi" when the topic is downloaded', async () => {
    renderPathWithOfflineAudio({
      cached: [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D],
    });

    const unit = await findUnitSection('Chào hỏi');
    const button = await findButtonByVisibleText(unit, 'Xóa audio');

    expect(button).toHaveAccessibleName(REMOVE_NAME);
    expect(within(unit).getByRole('button', { name: REMOVE_NAME })).toBe(
      button,
    );
    const visibleText = button.textContent ?? '';
    expect(REMOVE_NAME.startsWith(visibleText)).toBe(true);
  });

  it('S8.4-AC1 Tải bằng bàn phím và nghe được kết quả: should announce "Đang tải audio chủ đề Chào hỏi." then "Đã tải xong audio chủ đề Chào hỏi." and never the percent progress', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const downloadButton = await findButtonByVisibleText(
      unit,
      'Tải audio (2,4 MB)',
    );

    for (
      let step = 0;
      step < MAX_TAB_STEPS && document.activeElement !== downloadButton;
      step += 1
    ) {
      await user.tab();
    }
    expect(downloadButton).toHaveFocus();

    await user.keyboard('{Enter}');

    const announcer = screen.getByRole('status', { name: ANNOUNCER_NAME });
    expect(announcer).toHaveTextContent('Đang tải audio chủ đề Chào hỏi.');

    const snapshots: string[] = [];
    for (const path of [AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D]) {
      await releaseInAct(cache, path);
      snapshots.push(announcer.textContent ?? '');
    }

    expect(announcer).toHaveTextContent('Đã tải xong audio chủ đề Chào hỏi.');
    snapshots.forEach((text) => {
      expect(text).not.toContain('Đang tải 25%');
      expect(text).not.toContain('Đang tải 50%');
      expect(text).not.toContain('Đang tải 75%');
    });
    unmount();
  });

  it('S8.4-AC1 Hai chủ đề báo cùng lúc thì đọc đủ cả hai: should keep "Đã tải xong audio chủ đề Chào hỏi." in the region when "Đã tải xong audio chủ đề Gia đình." is added right after', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio({
      index: HSK_TWO_UNITS_INDEX,
    });

    const greetings = await findUnitSection('Chào hỏi');
    const family = await findUnitSection('Gia đình');
    await user.click(
      await findButtonByVisibleText(greetings, 'Tải audio (2,4 MB)'),
    );
    const familyLabel = await within(family).findByText(/^Tải audio \(/);
    const familyButton = familyLabel.closest('button');
    if (!familyButton) {
      throw new Error('Không tìm thấy nút tải audio của "Gia đình"');
    }
    await user.click(familyButton);

    const announcer = screen.getByRole('status', { name: ANNOUNCER_NAME });
    const sentencesOf = (region: HTMLElement): string[] =>
      Array.from(region.querySelectorAll('p'), (p) => p.textContent ?? '');

    // A, B, C (chung) về trước; D là file cuối của "Chào hỏi", E là file cuối của "Gia đình".
    await releaseInAct(cache, AUDIO_A, AUDIO_B, AUDIO_C);
    await releaseInAct(cache, AUDIO_D);
    expect(sentencesOf(announcer)).toContain(FINISHED_GREETINGS);

    await releaseInAct(cache, AUDIO_E);
    const sentences = sentencesOf(announcer);

    expect(sentences).toContain(FINISHED_GREETINGS);
    expect(sentences).toContain(FINISHED_FAMILY);
    expect(sentences.indexOf(FINISHED_GREETINGS)).toBeLessThan(
      sentences.indexOf(FINISHED_FAMILY),
    );
    unmount();
  });

  it('S8.4-AC1 Focus khi tải lỗi: should move focus back to "Tải audio (2,4 MB), chủ đề Chào hỏi" and announce "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." when the 3rd file fails on network', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const downloadButton = await findButtonByVisibleText(
      unit,
      'Tải audio (2,4 MB)',
    );

    for (
      let step = 0;
      step < MAX_TAB_STEPS && document.activeElement !== downloadButton;
      step += 1
    ) {
      await user.tab();
    }
    expect(downloadButton).toHaveFocus();

    await user.keyboard('{Enter}');
    await releaseInAct(cache, AUDIO_A, AUDIO_B);
    await failInAct(cache, AUDIO_C, 'network');

    expect(
      within(unit).getByRole('button', { name: DOWNLOAD_NAME }),
    ).toHaveFocus();
    const announcer = screen.getByRole('status', { name: ANNOUNCER_NAME });
    expect(announcer).toHaveTextContent(DOWNLOAD_INCOMPLETE);
    unmount();
  });

  it('S8.4-AC1 Không kéo focus khi người học đã đi chỗ khác: should keep focus on a lesson link in "Phát âm" when "Chào hỏi" finishes downloading after the learner tabbed away', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const intro = await findUnitSection('Phát âm');
    const unit = await findUnitSection('Chào hỏi');
    const lessonLinks = await within(intro).findAllByRole('link');
    await user.click(await findButtonByVisibleText(unit, 'Tải audio (2,4 MB)'));

    for (
      let step = 0;
      step < MAX_TAB_STEPS &&
      !lessonLinks.some((link) => link === document.activeElement);
      step += 1
    ) {
      await user.tab({ shift: true });
    }
    const focusedLink = document.activeElement;
    expect(lessonLinks).toContain(focusedLink);

    await releaseInAct(cache, AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D);

    expect(within(unit).getByText('Đã tải audio (2,4 MB)')).toBeInTheDocument();
    expect(document.activeElement).toBe(focusedLink);
    unmount();
  });

  it('S8.4-AC1 Không kéo focus khi người học đã đi chỗ khác: should leave focus on the page body when the learner clicked non-focusable text outside the audio block before "Chào hỏi" finished downloading', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const downloadButton = await findButtonByVisibleText(
      unit,
      'Tải audio (2,4 MB)',
    );
    await user.click(downloadButton);
    expect(document.activeElement).not.toBe(document.body);

    await user.click(
      within(unit).getByRole('heading', { level: 3, name: 'Chào hỏi' }),
    );
    expect(document.activeElement).toBe(document.body);

    await releaseInAct(cache, AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D);

    expect(within(unit).getByText('Đã tải audio (2,4 MB)')).toBeInTheDocument();
    expect(document.activeElement).toBe(document.body);
    unmount();
  });
});
