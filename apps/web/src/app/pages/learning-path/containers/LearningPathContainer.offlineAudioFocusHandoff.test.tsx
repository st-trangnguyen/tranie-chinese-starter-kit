import { screen, within } from '@test/render';
import {
  INTRO_UNIT_ID,
  mockPathContent,
  type PathStage,
  releaseInAct,
  renderPathWithOfflineAudio,
} from '@test/offline-audio.render';
import {
  AUDIO_A,
  AUDIO_B,
  AUDIO_C,
  AUDIO_E,
  GREETINGS_MISSING_SHARED_INDEX,
  HSK_STAGE_ID,
  HSK_UNIT_2_ID,
  HSK_UNIT_ID,
} from '@test/offline-audio.fixtures';

const GREETINGS_REMOVE_NAME = 'Xóa audio, chủ đề Chào hỏi';
const MAX_TAB_STEPS = 30;

const INTRO_STAGE: PathStage = {
  id: 'intro',
  title: 'Nhập môn',
  units: [{ id: INTRO_UNIT_ID, title: 'Phát âm', lessonIds: ['l1'] }],
};
const GREETINGS_UNIT = {
  id: HSK_UNIT_ID,
  title: 'Chào hỏi',
  lessonIds: ['l2'],
};
const FAMILY_UNIT = { id: HSK_UNIT_2_ID, title: 'Gia đình', lessonIds: ['l3'] };

const GREETINGS_FIRST: readonly PathStage[] = [
  INTRO_STAGE,
  { id: HSK_STAGE_ID, title: 'HSK 1', units: [GREETINGS_UNIT, FAMILY_UNIT] },
];
const FAMILY_FIRST: readonly PathStage[] = [
  INTRO_STAGE,
  { id: HSK_STAGE_ID, title: 'HSK 1', units: [FAMILY_UNIT, GREETINGS_UNIT] },
];

const findUnitSection = async (title: string): Promise<HTMLElement> => {
  const heading = await screen.findByRole('heading', { level: 3, name: title });
  const section = heading.closest('section');
  if (!section) {
    throw new Error(`Không tìm thấy khối của chủ đề "${title}"`);
  }
  return section;
};

const findDownloadButton = async (unit: HTMLElement): Promise<HTMLElement> => {
  const label = await within(unit).findByText(/^Tải audio \(/);
  const button = label.closest('button');
  if (!button) {
    throw new Error('Không tìm thấy nút "Tải audio"');
  }
  return button;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LearningPathContainer — audio offline: focus khi nút tải tự biến mất', () => {
  it.each([
    {
      order: '"Chào hỏi" đứng trước "Gia đình"',
      stages: GREETINGS_FIRST,
      isShiftTab: true,
    },
    {
      order: '"Gia đình" đứng trước "Chào hỏi"',
      stages: FAMILY_FIRST,
      isShiftTab: false,
    },
  ])(
    'S8.4-AC1 Nút tải đang focus biến mất vì chủ đề tự thành đã tải ($order): should move focus to "Xóa audio" of "Chào hỏi" when "Gia đình" finishes the shared file "Chào hỏi" was missing',
    async ({ stages, isShiftTab }) => {
      mockPathContent(stages);
      const { user, cache, unmount } = renderPathWithOfflineAudio({
        cached: [AUDIO_A, AUDIO_B],
        index: GREETINGS_MISSING_SHARED_INDEX,
      });

      const greetings = await findUnitSection('Chào hỏi');
      const family = await findUnitSection('Gia đình');
      const familyButton = await findDownloadButton(family);
      const greetingsButton = await findDownloadButton(greetings);

      for (
        let step = 0;
        step < MAX_TAB_STEPS && document.activeElement !== familyButton;
        step += 1
      ) {
        await user.tab();
      }
      expect(familyButton).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(within(family).getByText(/^Đang tải/)).toBeInTheDocument();

      for (
        let step = 0;
        step < MAX_TAB_STEPS && document.activeElement !== greetingsButton;
        step += 1
      ) {
        await user.tab({ shift: isShiftTab });
      }
      expect(greetingsButton).toHaveFocus();

      // `AUDIO_C` (file "Chào hỏi" còn thiếu) về cuối cùng.
      await releaseInAct(cache, AUDIO_E, AUDIO_C);

      expect(
        within(greetings).getByText(/^Đã tải audio \(/),
      ).toBeInTheDocument();
      expect(
        within(greetings).getByRole('button', { name: GREETINGS_REMOVE_NAME }),
      ).toHaveFocus();
      unmount();
    },
  );
});
