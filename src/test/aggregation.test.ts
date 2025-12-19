import { describe, it, expect } from 'vitest';
import { computeCategoryOrderCountsFromOrders } from '@/utils/aggregation';

describe('computeCategoryOrderCountsFromOrders', () => {
  it('counts distinct orders per category correctly', () => {
    const orders = [
      {
        _id: 'o1',
        items: [
          { product: { _id: 'p1', category: 'c1' } },
          { product: { _id: 'p2', category: 'c1' } }, // same category, should count once for order
        ],
      },
      {
        _id: 'o2',
        items: [
          { product: { _id: 'p3', category: 'c1' } },
          { product: { _id: 'p4', category: 'c2' } },
        ],
      },
      {
        _id: 'o3',
        items: [
          { product: { _id: 'p5', category: 'c3' } },
        ],
      },
    ];

    const res = computeCategoryOrderCountsFromOrders(orders as any);
    // Convert to map for easier assertions
    const map = new Map(res.map((r) => [r.categoryId, r.orderCount]));

    expect(map.get('c1')).toBe(2); // orders o1 and o2
    expect(map.get('c2')).toBe(1); // order o2
    expect(map.get('c3')).toBe(1); // order o3
  });
});
