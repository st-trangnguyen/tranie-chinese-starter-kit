import { createDatabase } from '@core/helpers/db.helper';
import { mockContentFetch } from '@test/mocks/content-fetch';
import { screen, userEvent, within } from '@test/render';
import { openRoute } from '@test/stroke-order-route';

const CONTENT_ROOT = {
  contentVersion: '0123456789ab',
  stages: [
    {
      id: 'intro',
      title: 'Nhập môn',
      units: [{ id: 'intro-a', title: 'Phát âm', lessonIds: ['l1', 'l2'] }],
    },
  ],
};

const LESSON_TITLES: Record<string, string> = {
  l1: 'Bốn thanh điệu',
  l2: 'Thanh nhẹ',
};

const respondToContent = (input: RequestInfo | URL): Response => {
  const url = String(input);
  if (url === '/content/content.json') {
    return Response.json(CONTENT_ROOT);
  }
  const lessonId = /\/content\/lessons\/(.+)\.json$/.exec(url)?.[1] ?? '';
  return Response.json({
    id: lessonId,
    type: 'lesson',
    title: LESSON_TITLES[lessonId] ?? lessonId,
    exercises: [{ id: 'e1', kind: 'tone-choice', wordId: '八' }],
  });
};

const SETTING_GROUP_NAMES = [
  'Mục tiêu mỗi ngày',
  'Tốc độ audio mặc định',
  'Hiện pinyin',
] as const;

const db = createDatabase();

beforeEach(async () => {
  await db.settings.clear();
  await db.lessonProgress.clear();
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    mockContentFetch(async (input) => respondToContent(input)),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Số lựa chọn đang chọn/bật trong một nhóm: radio checked hoặc công tắc bật. */
const countSelected = (group: HTMLElement): number => {
  const radios = within(group).queryAllByRole('radio');
  const switches = within(group).queryAllByRole('switch');
  return [...radios, ...switches].filter(
    (control) => control instanceof HTMLInputElement && control.checked,
  ).length;
};

describe('LearningPathContainer — liên kết Cài đặt', () => {
  it('S8.2-AC1 Mở Cài đặt từ màn Lộ trình: should open the "Cài đặt" screen with three setting groups, each with one selected option', async () => {
    const user = userEvent.setup();
    const { router } = openRoute('/learning-paths');
    expect(
      await screen.findByRole('link', { name: /Bốn thanh điệu/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Cài đặt' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cài đặt' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');

    for (const name of SETTING_GROUP_NAMES) {
      const group = await screen.findByRole('group', { name });
      expect(countSelected(group)).toBe(1);
    }
  });
});
