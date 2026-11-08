

export const ORDERS_STATUSES = [
 
     'PENDING',
     'CONFIRMED',
     'SHIPPED',
     'DELIVERED',
     'CANCELLED',
]  as const;

export type OrderStatus = (typeof ORDERS_STATUSES)[number];