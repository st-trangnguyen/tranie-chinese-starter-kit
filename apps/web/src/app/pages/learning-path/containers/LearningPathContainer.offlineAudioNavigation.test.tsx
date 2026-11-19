import { act, screen, within } from '@test/render';
import {
  mockPathContent,
  releaseInAct,
  renderAppRoutesWithOfflineAudio,
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

const findDownloadButton = async (
  unit: HTMLElement,
): Promise<HTMLButtonElement> => {
  const label = await within(unit).findByText('Tải audio (2,4 MB)');
  const button = label.closest('button');
  if (!button) {
    throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
  }
  return button;
};

beforeEach(() => {
  mockPathContent();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LearningPathContainer — audio offline khi rời bản đồ rồi quay lại', () => {
  it('S8.4-AC1 Rời màn khi đang tải: should show "Đã tải audio (2,4 MB)" under "Chào hỏi" when coming back to the map after all files finished while on a lesson', async () => {
    const { user, router, cache, unmount } =
      renderAppRoutesWithOfflineAudio('/learning-paths');

    const unit = await findUnitSection('Chào hỏi');
    await user.click(await findDownloadButton(unit));

    // Tiến độ trống: bài đầu của Nhập môn ("Phát âm") là bài mở duy nhất, bấm để vào bài.
    const intro = await findUnitSection('Phát âm');
    await user.click(within(intro).getByRole('link', { name: /Bài l1/ }));

    expect(router.state.location.pathname).toBe('/lessons/l1');
    // Màn bài nạp lười: chờ màn bài hiện câu đầu; bản đồ đã unmount, khối "Chào hỏi" không còn.
    expect(await screen.findByText('Câu 1 / 1')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Chào hỏi' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Đang tải/)).not.toBeInTheDocument();

    // Mọi file tải xong khi người học đang ở màn bài.
    await releaseInAct(cache, AUDIO_A, AUDIO_B, AUDIO_C, AUDIO_D);

    // Quay lại bản đồ bằng nút back của trình duyệt.
    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe('/learning-paths');

    const unitAgain = await findUnitSection('Chào hỏi');
    expect(
      await within(unitAgain).findByText('Đã tải audio (2,4 MB)'),
    ).toBeInTheDocument();
    expect(within(unitAgain).queryByText(/Đang tải/)).not.toBeInTheDocument();
    expect(
      within(unitAgain).queryByText(/^Tải audio \(/),
    ).not.toBeInTheDocument();
    unmount();
  });
  it('S8.4-AC1 Quay lại màn khi việc tải còn đang chạy: should show "Đang tải 50%" without download button under "Chào hỏi" when coming back to the map after 2 of 4 files finished, then "Đã tải audio (2,4 MB)" once the rest finish', async () => {
    const { user, router, cache, unmount } =
      renderAppRoutesWithOfflineAudio('/learning-paths');

    const unit = await findUnitSection('Chào hỏi');
    await user.click(await findDownloadButton(unit));

    // Tiến độ trống: bài đầu của Nhập môn ("Phát âm") là bài mở duy nhất, bấm để vào bài.
    const intro = await findUnitSection('Phát âm');
    await user.click(within(intro).getByRole('link', { name: /Bài l1/ }));

    expect(router.state.location.pathname).toBe('/lessons/l1');
    expect(await screen.findByText('Câu 1 / 1')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Chào hỏi' }),
    ).not.toBeInTheDocument();

    // Mới xong 2/4 file khi người học đang ở màn bài; việc tải vẫn còn chạy.
    await releaseInAct(cache, AUDIO_A, AUDIO_B);

    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe('/learning-paths');

    const unitAgain = await findUnitSection('Chào hỏi');
    expect(
      await within(unitAgain).findByText('Đang tải 50%'),
    ).toBeInTheDocument();
    expect(
      within(unitAgain).queryByText(/^Tải audio \(/),
    ).not.toBeInTheDocument();
    expect(
      within(unitAgain).queryByRole('button', { name: /audio/i }),
    ).not.toBeInTheDocument();

    // Thả nốt 2 file còn lại khi đang ở bản đồ.
    await releaseInAct(cache, AUDIO_C, AUDIO_D);

    expect(
      await within(unitAgain).findByText('Đã tải audio (2,4 MB)'),
    ).toBeInTheDocument();
    expect(within(unitAgain).queryByText(/Đang tải/)).not.toBeInTheDocument();
    unmount();
  });
});
