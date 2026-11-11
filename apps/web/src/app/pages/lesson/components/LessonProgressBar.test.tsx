import { renderWithProviders, screen } from '@test/render';
import { LessonProgressBar } from './LessonProgressBar';

describe('LessonProgressBar', () => {
  it('S3.2-AC1: should report finished exercises, not the one being answered', () => {
    renderWithProviders(<LessonProgressBar current={2} total={3} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAccessibleName('Câu 2 / 3');
  });

  it('S3.2-AC1: should start empty on the first exercise', () => {
    renderWithProviders(<LessonProgressBar current={1} total={1} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });
});
