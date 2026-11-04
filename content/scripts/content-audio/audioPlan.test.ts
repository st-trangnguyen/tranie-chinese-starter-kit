import { audioJob } from '../content-build/audio';
import { planAudio } from './audioPlan';

describe('audioJob', () => {
  it('should give the same file name when text and voice are unchanged', () => {
    expect(audioJob('你好', 'female').path).toBe(
      audioJob('你好', 'female').path,
    );
  });

  it('should give a new file name when the voice or text changes', () => {
    const base = audioJob('你好', 'female').path;

    expect(audioJob('你好', 'male').path).not.toBe(base);
    expect(audioJob('您好', 'female').path).not.toBe(base);
    expect(base).toMatch(/^audio\/[0-9a-f]{16}\.mp3$/);
  });
});

describe('planAudio', () => {
  const hello = audioJob('你好', 'female');
  const thanks = audioJob('谢谢', 'female');

  it('should not regenerate files that already exist', () => {
    const plan = planAudio([hello, thanks], [hello.path]);

    expect(plan.missing).toEqual([thanks]);
  });

  it('should return nothing to do on a second run', () => {
    const plan = planAudio([hello, thanks], [hello.path, thanks.path]);

    expect(plan).toEqual({ missing: [], orphans: [] });
  });

  it('should list files no job uses any more as orphans', () => {
    const plan = planAudio([hello], [hello.path, 'audio/0000000000000000.mp3']);

    expect(plan.orphans).toEqual(['audio/0000000000000000.mp3']);
  });
});
