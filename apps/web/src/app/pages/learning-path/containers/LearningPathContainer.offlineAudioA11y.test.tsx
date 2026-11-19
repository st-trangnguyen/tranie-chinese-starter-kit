import { screen, within } from '@test/render';
import {
  mockPathContent,
  renderPathWithOfflineAudio,
} from '@test/offline-audio.render';
import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_D,
} from '@test/offline-audio.fixtures';

const DOWNLOAD_NAME = 'Tải audio (2,4 MB), chủ đề Chào hỏi';
const REMOVE_NAME = 'Xóa audio, chủ đề Chào hỏi';

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
});
