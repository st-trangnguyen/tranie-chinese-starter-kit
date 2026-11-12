export function orderPair<T>(
  pair: readonly [T, T],
  random: () => number = Math.random,
): readonly [T, T] {
  const [first, second] = pair;

  return random() < 0.5 ? [first, second] : [second, first];
}
