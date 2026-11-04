import { renderWithProviders, screen, waitFor } from '@test/render';
import { useInstallPrompt } from '@core/hooks/useInstallPrompt';
import { ProgressService } from '@shared/services/progress.service';
import OnboardingContainer from './OnboardingContainer';

vi.mock('@shared/services/progress.service');
vi.mock('@core/hooks/useInstallPrompt');

const needsOnboarding = vi.fn();
const completeOnboarding = vi.fn();
const promptInstall = vi.fn();

const mockInstallPrompt = (
  overrides: { isStandalone?: boolean; canPrompt?: boolean } = {},
) => {
  vi.mocked(useInstallPrompt).mockReturnValue({
    isStandalone: false,
    canPrompt: false,
    isIos: false,
    promptInstall,
    ...overrides,
  });
};

const renderOnboarding = () =>
  renderWithProviders(<OnboardingContainer />, { route: '/onboarding' });

beforeEach(() => {
  vi.mocked(ProgressService).prototype.needsOnboarding = needsOnboarding;
  vi.mocked(ProgressService).prototype.completeOnboarding = completeOnboarding;
  needsOnboarding.mockResolvedValue(true);
  completeOnboarding.mockResolvedValue(undefined);
  promptInstall.mockResolvedValue(undefined);
  mockInstallPrompt();
});

describe('OnboardingContainer', () => {
  it('welcomes, lets the learner pick 30 minutes and saves it', async () => {
    const { user } = renderOnboarding();

    await user.click(await screen.findByRole('button', { name: 'Bắt đầu' }));
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    await user.click(screen.getByRole('radio', { name: /30 phút/ }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(completeOnboarding).toHaveBeenCalledWith(30);
  });

  it('suggests installing with a skip button when not running as a PWA', async () => {
    mockInstallPrompt({ canPrompt: true });
    const { user } = renderOnboarding();

    await user.click(await screen.findByRole('button', { name: 'Bắt đầu' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(
      await screen.findByRole('heading', {
        name: 'Cài app lên màn hình chính',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/lesson/intro-01',
    );
  });

  it('goes straight to lesson 1 when already installed', async () => {
    mockInstallPrompt({ isStandalone: true });
    const { user } = renderOnboarding();

    await user.click(await screen.findByRole('button', { name: 'Bắt đầu' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/lesson/intro-01',
      ),
    );
  });

  it('never shows onboarding again once completed', async () => {
    needsOnboarding.mockResolvedValue(false);
    renderOnboarding();

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/lesson/intro-01',
      ),
    );
    expect(
      screen.queryByRole('button', { name: 'Bắt đầu' }),
    ).not.toBeInTheDocument();
  });

  it('stays on the goal step and shows an error when saving fails', async () => {
    completeOnboarding.mockRejectedValue(new Error('IndexedDB blocked'));
    const { user } = renderOnboarding();

    await user.click(await screen.findByRole('button', { name: 'Bắt đầu' }));
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Chưa lưu được');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });
});
