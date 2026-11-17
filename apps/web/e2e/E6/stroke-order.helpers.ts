/** hanzi-writer thật vẽ mỗi nét ~0,3–0,7 s: chờ theo số nét (design "Test"). */
export const strokePollTimeout = (strokeCount: number): number =>
  5_000 + strokeCount * 1_000;

export const strokeOrderPath = (character: string): string =>
  `/characters/${encodeURIComponent(character)}/stroke-order`;
