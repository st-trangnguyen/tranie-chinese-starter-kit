import { useRegisterSW } from 'virtual:pwa-register/react';

import { renderWithProviders, screen } from '@test/render';
import { UpdateBanner } from './UpdateBanner';

vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: vi.fn() }));

const updateServiceWorker = vi.fn();
const setNeedRefresh = vi.fn();

const mockRegisterSW = (needRefresh: boolean) => {
  vi.mocked(useRegisterSW).mockReturnValue({
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  });
};

describe('UpdateBanner', () => {
  it('renders nothing while the app is up to date', () => {
    mockRegisterSW(false);
    renderWithProviders(<UpdateBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('reloads only after the learner clicks', async () => {
    mockRegisterSW(true);
    const { user } = renderWithProviders(<UpdateBanner />);

    expect(screen.getByRole('status')).toHaveTextContent('Có bản mới');
    expect(updateServiceWorker).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Tải lại' }));

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('can be dismissed until the next update', async () => {
    mockRegisterSW(true);
    const { user } = renderWithProviders(<UpdateBanner />);

    await user.click(screen.getByRole('button', { name: 'Để sau' }));

    expect(setNeedRefresh).toHaveBeenCalledWith(false);
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });
});
