import { OrderStatus } from './order';

export interface Delivery {
  id: number;
  orderId: number;
  shop: {
    id: number;
    name: string;
    address?: string;
  };
  destination?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  status: OrderStatus;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  totalAmount?: number;
  distanceKm?: number;
}
