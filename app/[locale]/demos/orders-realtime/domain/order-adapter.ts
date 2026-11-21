import { ORDER_ITEM_FIXTURES, createOrdersWorkspace } from "./order-fixtures";
import type { OrdersDomainAdapter } from "./order-contracts";
import { calculateCartTotals } from "./order-validation";
import type { OrderItem, OrderItemId } from "./order-types";

const catalog: readonly OrderItem[] = (Object.keys(ORDER_ITEM_FIXTURES) as OrderItemId[]).map((itemId) => ({
  ...ORDER_ITEM_FIXTURES[itemId],
}));

export const ordersDomainAdapter: OrdersDomainAdapter = {
  getInitialWorkspace: createOrdersWorkspace,
  getCatalog: () => catalog.map((item) => ({ ...item })),
  getCartTotals: calculateCartTotals,
};
