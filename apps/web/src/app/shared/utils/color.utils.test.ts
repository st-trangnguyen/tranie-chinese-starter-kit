import { contrastRatio } from './color.utils';

describe('contrastRatio', () => {
  it('should return 21 when comparing black with white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('should return 1 when both colors are identical', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
  });

  it('should return the same ratio when the arguments are swapped', () => {
    const forward = contrastRatio('#315C50', '#FFFFFF');

    expect(forward).toBe(contrastRatio('#FFFFFF', '#315C50'));
    expect(forward).toBeCloseTo(7.56, 2);
  });

  it('should throw when a color is not #RRGGBB', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow();
  });
});
