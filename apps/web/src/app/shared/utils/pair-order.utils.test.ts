import { describe, expect, it } from 'vitest';

import { orderPair } from './pair-order.utils';

describe('orderPair', () => {
  it('S4.2-AC1: random trả 0 thì giữ nguyên thứ tự cặp', () => {
    expect(orderPair(['sì', 'shì'] as const, () => 0)).toEqual(['sì', 'shì']);
  });

  it('S4.2-AC1: random trả 0.9 thì đảo thứ tự cặp', () => {
    expect(orderPair(['sì', 'shì'] as const, () => 0.9)).toEqual(['shì', 'sì']);
  });

  it('S4.2-AC1: không mutate cặp đầu vào', () => {
    const pair = ['sì', 'shì'] as const;

    orderPair(pair, () => 0.9);

    expect(pair).toEqual(['sì', 'shì']);
  });
});
