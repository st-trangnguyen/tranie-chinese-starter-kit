import { act, screen, within } from '@test/render';
import {
  mockPathContent,
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
  it('S8.4-AC1 Chủ đề đang khóa vẫn tải được: should download audio of locked "Chào hỏi" and keep its lessons locked', async () => {
    // Tiến độ trống: chỉ bài đầu của Nhập môn mở, mọi bài của "Chào hỏi" (HSK 1) đang khóa.
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const lessonsBefore = within(unit).getAllByRole('listitem');
    expect(lessonsBefore.length).toBeGreaterThan(0);
    lessonsBefore.forEach((lesson) =>
      expect(lesson).toHaveTextContent('Đã khóa'),
    );

    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    await user.click(downloadButton);
    await cache.release(AUDIO_A);
    await cache.release(AUDIO_B);
    await cache.release(AUDIO_C);
    await cache.release(AUDIO_D);

    expect(
      await within(unit).findByText('Đã tải audio (2,4 MB)'),
    ).toBeInTheDocument();
    const lessonsAfter = within(unit).getAllByRole('listitem');
    expect(lessonsAfter).toHaveLength(lessonsBefore.length);
    lessonsAfter.forEach((lesson) =>
      expect(lesson).toHaveTextContent('Đã khóa'),
    );
    unmount();
  });
  it('S8.4-AC1 Bấm tải khi không có mạng: should show "Cần có mạng để tải audio." under "Chào hỏi" and keep the download button without downloading', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    // Mất mạng: getter trả false và phát sự kiện `offline` để màn hình biết.
    // Spy được khôi phục bởi `vi.restoreAllMocks()` trong afterEach.
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(navigator.onLine).toBe(false);

    await user.click(downloadButton);

    expect(
      await within(unit).findByText('Cần có mạng để tải audio.'),
    ).toBeInTheDocument();
    expect(within(unit).getByText('Tải audio (2,4 MB)')).toBeInTheDocument();
    expect(within(unit).queryByText(/Đang tải/)).not.toBeInTheDocument();
    expect(cache.downloadCalls).toEqual([]);
    unmount();
  });
  it('S8.4-AC1 Mất mạng khi đang tải: should show "Tải chưa xong. Hãy kiểm tra mạng rồi thử lại." under "Chào hỏi" and bring back the download button when the 3rd of 4 files fails on network', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    await user.click(downloadButton);
    await cache.release(AUDIO_A);
    await cache.release(AUDIO_B);
    await cache.fail(AUDIO_C, 'network');
    // File 4 không được tải sau lỗi; thả trước nếu service vẫn gọi, để không để promise treo.
    await cache.release(AUDIO_D);

    expect(
      await within(unit).findByText(
        'Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.',
      ),
    ).toBeInTheDocument();
    expect(within(unit).getByText('Tải audio (2,4 MB)')).toBeInTheDocument();
    expect(within(unit).queryByText(/Đang tải/)).not.toBeInTheDocument();
    unmount();
  });
  it('S8.4-AC1 Không đủ bộ nhớ: should show the storage-full message under "Chào hỏi" and bring back the download button when a file fails with storage-full', async () => {
    const { user, cache, unmount } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    await user.click(downloadButton);
    await cache.release(AUDIO_A);
    await cache.fail(AUDIO_B, 'storage-full');
    await cache.release(AUDIO_C);
    await cache.release(AUDIO_D);

    expect(
      await within(unit).findByText(
        'Không đủ bộ nhớ để tải audio. Hãy xóa audio của chủ đề khác rồi thử lại.',
      ),
    ).toBeInTheDocument();
    expect(within(unit).getByText('Tải audio (2,4 MB)')).toBeInTheDocument();
    expect(within(unit).queryByText(/Đang tải/)).not.toBeInTheDocument();
    unmount();
  });
  it('S8.4-AC1 Thông báo của mỗi chủ đề độc lập: should keep "Cần có mạng để tải audio." under "Chào hỏi" and show "Đã xóa audio của chủ đề Gia đình." only under "Gia đình" after removing its audio', async () => {
    // "Gia đình" (C, E) đã tải sẵn; "Chào hỏi" (A, B, C, D) chưa tải.
    const { user, unmount } = renderPathWithOfflineAudio({
      cached: [AUDIO_C, AUDIO_E],
      index: HSK_TWO_UNITS_INDEX,
    });

    const unitA = await findUnitSection('Chào hỏi');
    const unitB = await findUnitSection('Gia đình');
    const downloadLabel = await within(unitA).findByText(/^Tải audio \(/);
    const downloadButton = downloadLabel.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút tải audio của "Chào hỏi"');
    }
    const removeLabel = await within(unitB).findByText('Xóa audio');
    const removeButton = removeLabel.closest('button');
    if (!removeButton) {
      throw new Error('Không tìm thấy nút "Xóa audio" của "Gia đình"');
    }

    // Mất mạng: getter trả false và phát sự kiện `offline` để màn hình biết.
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await user.click(downloadButton);
    expect(
      await within(unitA).findByText('Cần có mạng để tải audio.'),
    ).toBeInTheDocument();

    // Xóa không cần mạng.
    await user.click(removeButton);

    expect(
      await within(unitB).findByText('Đã xóa audio của chủ đề Gia đình.'),
    ).toBeInTheDocument();
    expect(
      within(unitA).getByText('Cần có mạng để tải audio.'),
    ).toBeInTheDocument();
    expect(
      within(unitA).queryByText(/Đã xóa audio của chủ đề/),
    ).not.toBeInTheDocument();
    expect(
      within(unitB).queryByText('Cần có mạng để tải audio.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/\{\{topic\}\}/)).not.toBeInTheDocument();
    unmount();
  });
});
