import { screen, within } from '@test/render';
import {
  INTRO_UNIT_ID,
  mockPathContent,
  renderPathWithOfflineAudio,
  type PathStage,
} from '@test/offline-audio.render';
import {
  EMPTY_AUDIO_UNITS_INDEX,
  HSK_STAGE_ID,
  HSK_UNIT_ID,
  INTRO_EMPTY_UNIT_ID,
} from '@test/offline-audio.fixtures';

const MAX_TAB_STEPS = 30;

/** Nhập môn mở trước nên "Chào hỏi" bị khóa; bài `l2-test` là bài `test` → có link "Kiểm tra vượt cấp". */
const STAGES_WITH_PLACEMENT_TEST: readonly PathStage[] = [
  {
    id: 'intro',
    title: 'Nhập môn',
    units: [{ id: INTRO_UNIT_ID, title: 'Phát âm', lessonIds: ['l1'] }],
  },
  {
    id: HSK_STAGE_ID,
    title: 'HSK 1',
    units: [
      { id: HSK_UNIT_ID, title: 'Chào hỏi', lessonIds: ['l2', 'l2-test'] },
    ],
  },
];

/** Nhập môn có hai chủ đề: "Phát âm" có audio, "Thanh điệu" có `[]` trong index. */
const STAGES_WITH_EMPTY_INTRO_UNIT: readonly PathStage[] = [
  {
    id: 'intro',
    title: 'Nhập môn',
    units: [
      { id: INTRO_UNIT_ID, title: 'Phát âm', lessonIds: ['l1'] },
      { id: INTRO_EMPTY_UNIT_ID, title: 'Thanh điệu', lessonIds: ['l1b'] },
    ],
  },
  {
    id: HSK_STAGE_ID,
    title: 'HSK 1',
    units: [{ id: HSK_UNIT_ID, title: 'Chào hỏi', lessonIds: ['l2'] }],
  },
];

const OFFLINE_AUDIO_TEXTS: readonly RegExp[] = [
  /Tải audio/,
  /Đang tải/,
  /Đã tải audio/,
  /Xóa audio/,
  /Audio có sẵn offline/,
];

const expectNoOfflineAudioBlock = (unit: HTMLElement): void => {
  OFFLINE_AUDIO_TEXTS.forEach((text) => {
    expect(within(unit).queryByText(text)).not.toBeInTheDocument();
  });
  expect(
    within(unit).queryByRole('button', { name: /audio/i }),
  ).not.toBeInTheDocument();
  expect(unit.querySelector('.offline-audio')).toBeNull();
};

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

describe('LearningPathContainer — audio offline: nhãn và trạng thái', () => {
  it('S8.4-AC1 Chủ đề chưa tải có nút tải kèm dung lượng: should show one "Tải audio (2,4 MB)" button under the "Chào hỏi" heading', async () => {
    renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const heading = within(unit).getByRole('heading', {
      level: 3,
      name: 'Chào hỏi',
    });

    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const button = label.closest('button');
    expect(button).not.toBeNull();
    expect(within(unit).getAllByText('Tải audio (2,4 MB)')).toHaveLength(1);
    expect(
      heading.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(within(unit).queryByText(/Đang tải/)).not.toBeInTheDocument();
    expect(within(unit).queryByText(/Đã tải audio/)).not.toBeInTheDocument();
    expect(within(unit).queryByText('Xóa audio')).not.toBeInTheDocument();
  });

  it('S8.4-AC1 Khối audio nằm trên link kiểm tra vượt cấp: should place the "Tải audio (2,4 MB)" button after the "Chào hỏi" heading and before the "Kiểm tra vượt cấp" link, in DOM and Tab order', async () => {
    mockPathContent(STAGES_WITH_PLACEMENT_TEST, ['l2-test']);
    const { user } = renderPathWithOfflineAudio();

    const unit = await findUnitSection('Chào hỏi');
    const heading = within(unit).getByRole('heading', {
      level: 3,
      name: 'Chào hỏi',
    });
    const placementLink = await within(unit).findByRole('link', {
      name: 'Kiểm tra vượt cấp',
    });
    const label = await within(unit).findByText('Tải audio (2,4 MB)');
    const downloadButton = label.closest('button');
    if (!downloadButton) {
      throw new Error('Không tìm thấy nút "Tải audio (2,4 MB)"');
    }

    expect(
      heading.compareDocumentPosition(downloadButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      downloadButton.compareDocumentPosition(placementLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    for (
      let step = 0;
      step < MAX_TAB_STEPS &&
      document.activeElement !== downloadButton &&
      document.activeElement !== placementLink;
      step += 1
    ) {
      await user.tab();
    }
    expect(downloadButton).toHaveFocus();

    await user.tab();
    expect(placementLink).toHaveFocus();
  });
  it('S8.4-AC1 Chủ đề Nhập môn có sẵn offline: should show "Audio có sẵn offline" under the "Phát âm" heading without download or remove buttons', async () => {
    renderPathWithOfflineAudio();

    const unit = await findUnitSection('Phát âm');
    const heading = within(unit).getByRole('heading', {
      level: 3,
      name: 'Phát âm',
    });

    const label = await within(unit).findByText('Audio có sẵn offline');
    expect(within(unit).getAllByText('Audio có sẵn offline')).toHaveLength(1);
    expect(
      heading.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(within(unit).queryByText(/Tải audio/)).not.toBeInTheDocument();
    expect(within(unit).queryByText('Xóa audio')).not.toBeInTheDocument();
    expect(
      within(unit).queryByRole('button', { name: /audio/i }),
    ).not.toBeInTheDocument();
  });

  it('S8.4-AC1 Chủ đề không có audio: should render no offline audio block under the "Gia đình" heading when its audio list is empty', async () => {
    renderPathWithOfflineAudio({ index: EMPTY_AUDIO_UNITS_INDEX });

    // Đợi khối của chủ đề có audio hiện ra: danh sách audio đã nạp xong.
    const greetings = await findUnitSection('Chào hỏi');
    await within(greetings).findByText('Tải audio (2,4 MB)');

    const family = await findUnitSection('Gia đình');
    expectNoOfflineAudioBlock(family);
  });

  it('S8.4-AC1 Chủ đề Nhập môn không có audio thì không có khối: should render no block under "Thanh điệu" (empty audio list) while "Phát âm" still shows "Audio có sẵn offline"', async () => {
    mockPathContent(STAGES_WITH_EMPTY_INTRO_UNIT);
    renderPathWithOfflineAudio({ index: EMPTY_AUDIO_UNITS_INDEX });

    const pronunciation = await findUnitSection('Phát âm');
    expect(
      await within(pronunciation).findByText('Audio có sẵn offline'),
    ).toBeInTheDocument();

    const tones = await findUnitSection('Thanh điệu');
    expectNoOfflineAudioBlock(tones);
  });
});
