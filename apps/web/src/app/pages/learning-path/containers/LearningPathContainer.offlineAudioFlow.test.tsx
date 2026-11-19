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

const findUnitSection = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByRole('heading', { level: 3, name: title });
  const section = heading.closest('section');
  if (!section) {
    throw new Error(`Không tìm thấy khối của chủ đề "${title}"`);
  }
  return section;
};

beforeEach(() => {
  mockPathContent();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LearningPathContainer — audio offline: tải, xóa, thông báo', () => {
  it('S8.4-AC1 Hiện tiến độ khi đang tải: should show "Đang tải 25%" without download or remove buttons under "Chào hỏi" after 1 of 4 files is downloaded', async () => {
    // jsdom mặc định có mạng: bấm tải phải bắt đầu tải chứ không báo "Cần có mạng".
    expect(navigator.onLine).toBe(true);
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    await user.click(downloadButton);
    await cache.release(AUDIO_A);

    expect(await within(unit).findByText('Đang tải 25%')).toBeInTheDocument();
    expect(within(unit).queryByText(/Tải audio \(/)).not.toBeInTheDocument();
    expect(within(unit).queryByText('Xóa audio')).not.toBeInTheDocument();
    expect(
      within(unit).queryByRole('button', { name: /audio/i }),
    ).not.toBeInTheDocument();

    // Thả nốt các file còn lại để việc tải kết thúc, không để promise treo sau test.
    await cache.release(AUDIO_B);
    await cache.release(AUDIO_C);
    await cache.release(AUDIO_D);
    unmount();
  });
});
