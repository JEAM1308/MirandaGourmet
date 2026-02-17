import type { Order } from '../../src/shared/types/order.types';

const orders: Record<string, Order> = {};

export function saveOrder(order: Order) {
  orders[order.id] = order;
}

export function getOrder(id: string): Order | null {
  return orders[id] ?? null;
}
