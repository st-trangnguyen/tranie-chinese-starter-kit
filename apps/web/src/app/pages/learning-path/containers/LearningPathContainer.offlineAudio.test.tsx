import { screen, within } from '@test/render';
import {
  mockPathContent,
  renderPathWithOfflineAudio,
} from '@test/offline-audio.render';

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
});
