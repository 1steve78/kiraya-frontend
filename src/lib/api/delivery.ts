import { apiClient } from './client';
import { Delivery } from '@/types/delivery';
import { Order } from '@/types/order';

// Map the Spring Boot OrderResponse back to our conceptual Delivery type
const mapOrderToDelivery = (order: any): Delivery => ({
  id: order.id,
  orderId: order.id,
  shop: {
    id: order.shopId,
    name: order.shopName || `Shop #${order.shopId}`,
    address: order.shopAddress,
  },
  destination: {
    address: order.customerAddress || 'Customer Address',
  },
  status: order.status,
  totalAmount: order.totalAmount,
  assignedAt: order.createdAt, // Or actual assignedAt if added later
});

export const getAvailableDeliveries = async (): Promise<Delivery[]> => {
  // In our current backend, "ASSIGNED" to me means it's available for me to accept/reject
  // Or READY_FOR_PICKUP if it's broadcasted. Using /delivery/me/orders with status=ASSIGNED.
  const response: any = await apiClient.get('/delivery/me/orders?status=ASSIGNED');
  return (response.content || []).map(mapOrderToDelivery);
};

export const getMyDeliveries = async (): Promise<Delivery[]> => {
  const response: any = await apiClient.get('/delivery/me/orders');
  return (response.content || []).map(mapOrderToDelivery);
};

export const getDelivery = async (deliveryId: number): Promise<Delivery> => {
  // Currently we use the orders endpoint for details, since Delivery == Order
  const response = await apiClient.get(`/orders/${deliveryId}`);
  return mapOrderToDelivery(response);
};

export const acceptDelivery = async (deliveryId: number): Promise<Delivery> => {
  const response = await apiClient.patch(`/delivery/orders/${deliveryId}/status`, {
    status: 'ACCEPTED'
  });
  return mapOrderToDelivery(response);
};

export const rejectDelivery = async (deliveryId: number): Promise<Delivery> => {
  const response = await apiClient.patch(`/delivery/orders/${deliveryId}/status`, {
    status: 'READY_FOR_PICKUP',
    reason: 'Rejected by partner'
  });
  return mapOrderToDelivery(response);
};

export const markPickedUp = async (deliveryId: number): Promise<Delivery> => {
  const response = await apiClient.patch(`/delivery/orders/${deliveryId}/status`, {
    status: 'PICKED_UP'
  });
  return mapOrderToDelivery(response);
};

export const markOutForDelivery = async (deliveryId: number): Promise<Delivery> => {
  const response = await apiClient.patch(`/delivery/orders/${deliveryId}/status`, {
    status: 'OUT_FOR_DELIVERY'
  });
  return mapOrderToDelivery(response);
};

export const markDelivered = async (deliveryId: number): Promise<Delivery> => {
  const response = await apiClient.patch(`/delivery/orders/${deliveryId}/status`, {
    status: 'DELIVERED'
  });
  return mapOrderToDelivery(response);
};
