// src/components/tracking/types.ts
import { OrderStatus } from '@/types/order';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationWithTimestamp extends Coordinates {
  timestamp?: string | number | Date;
}

export interface PickupLocation extends Coordinates {
  name: string;
  address?: string;
}

export interface DestinationLocation extends Coordinates {
  name?: string;
  address?: string;
}

export interface DeliveryPartnerInfo {
  name: string;
  phone?: string;
  vehicle?: string;
  photoUrl?: string;
}

export interface DeliveryMapProps {
  deliveryId: number | string;
  pickup: PickupLocation;
  destination: DestinationLocation;
  partnerInfo?: DeliveryPartnerInfo;
  partnerLocation?: LocationWithTimestamp | null;
  status?: OrderStatus;
  connectionState?: 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  className?: string;
  onLocationUpdate?: (coords: Coordinates) => void;
}
