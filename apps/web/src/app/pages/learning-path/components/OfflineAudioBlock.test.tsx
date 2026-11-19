import type { OfflineAudioTopicView } from '@shared/models/offline-audio.model';
import { renderWithProviders, screen } from '@test/render';

import { OfflineAudioBlock } from './OfflineAudioBlock';

const UNIT_TITLE = 'Chào hỏi';
const TOPIC_BYTES = 2_516_582;

const NOT_DOWNLOADED: OfflineAudioTopicView = {
  status: 'not-downloaded',
  bytes: TOPIC_BYTES,
  message: null,
};
const DOWNLOADING: OfflineAudioTopicView = {
  status: 'downloading',
  percent: 25,
  message: null,
};
const DOWNLOADED: OfflineAudioTopicView = {
  status: 'downloaded',
  bytes: TOPIC_BYTES,
  canRemove: true,
  message: null,
};
const DOWNLOADED_NOT_REMOVABLE: OfflineAudioTopicView = {
  status: 'downloaded',
  bytes: TOPIC_BYTES,
  canRemove: false,
  message: null,
};
const DOWNLOAD_INCOMPLETE: OfflineAudioTopicView = {
  status: 'not-downloaded',
  bytes: TOPIC_BYTES,
  message: 'download-incomplete',
};

const renderBlock = (topic: OfflineAudioTopicView) => {
  const onDownload = vi.fn();
  const onRemove = vi.fn();
  const view = renderWithProviders(
    <OfflineAudioBlock
      unitTitle={UNIT_TITLE}
      topic={topic}
      onDownload={onDownload}
      onRemove={onRemove}
    />,
  );
  const rerenderWith = (next: OfflineAudioTopicView) =>
    view.rerender(
      <OfflineAudioBlock
        unitTitle={UNIT_TITLE}
        topic={next}
        onDownload={onDownload}
        onRemove={onRemove}
      />,
    );
  return { ...view, rerenderWith };
};

describe('OfflineAudioBlock', () => {
  it('S8.4-AC1: Focus khi bắt đầu và khi tải xong — focus theo dòng tiến độ rồi nút xóa', async () => {
    const { user, rerenderWith } = renderBlock(NOT_DOWNLOADED);

    await user.tab();
    expect(
      screen.getByRole('button', {
        name: 'Tải audio (2,4 MB), chủ đề Chào hỏi',
      }),
    ).toHaveFocus();

    rerenderWith(DOWNLOADING);
    expect(screen.getByText('Đang tải 25%')).toHaveFocus();

    rerenderWith(DOWNLOADED);
    expect(
      screen.getByRole('button', { name: 'Xóa audio, chủ đề Chào hỏi' }),
    ).toHaveFocus();
  });

  it('S8.4-AC1: Tải xong mà không có nút xóa thì focus tới dòng đã tải — focus dòng "Đã tải audio (2,4 MB)"', async () => {
    const { user, rerenderWith } = renderBlock(NOT_DOWNLOADED);

    await user.tab();
    rerenderWith(DOWNLOADING);
    expect(screen.getByText('Đang tải 25%')).toHaveFocus();

    rerenderWith(DOWNLOADED_NOT_REMOVABLE);

    expect(
      screen.queryByRole('button', { name: 'Xóa audio, chủ đề Chào hỏi' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Đã tải audio (2,4 MB)')).toHaveFocus();
  });

  it('S8.4-AC1: Focus khi tải lỗi — focus từ dòng tiến độ về nút "Tải audio"', async () => {
    const { user, rerenderWith } = renderBlock(NOT_DOWNLOADED);

    await user.tab();
    rerenderWith(DOWNLOADING);
    expect(screen.getByText('Đang tải 25%')).toHaveFocus();

    rerenderWith(DOWNLOAD_INCOMPLETE);

    expect(
      screen.getByText('Tải chưa xong. Hãy kiểm tra mạng rồi thử lại.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Tải audio (2,4 MB), chủ đề Chào hỏi',
      }),
    ).toHaveFocus();
  });
});
