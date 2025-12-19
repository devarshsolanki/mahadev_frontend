export interface OrderItemLike {
  product?: any | string;
}

export interface OrderLike {
  _id: string;
  items: OrderItemLike[];
}

// Compute number of orders that include each category.
// Returns array of { categoryId, orderCount }
export function computeCategoryOrderCountsFromOrders(orders: OrderLike[]) {
  const counts = new Map<string, number>();

  orders.forEach((order) => {
    const seen = new Set<string>();
    (order.items || []).forEach((item) => {
      const prod = item.product;
      if (!prod) return;
      const cat = typeof prod === 'string' ? prod : (prod.category || (prod.category?._id));
      if (!cat) return;
      const catId = typeof cat === 'string' ? cat : String(cat);
      seen.add(catId);
    });

    // increment each category once per order
    seen.forEach((catId) => {
      counts.set(catId, (counts.get(catId) || 0) + 1);
    });
  });

  return Array.from(counts.entries()).map(([categoryId, orderCount]) => ({ categoryId, orderCount }));
}

export default computeCategoryOrderCountsFromOrders;
