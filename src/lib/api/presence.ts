import { apiClient } from './client';

export type AvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface PartnerPresenceResponse {
  partnerId: number;
  status: AvailabilityStatus;
  lastSeen: string;
}

const getHeaders = (partnerId: number) => ({
  headers: {
    'X-Partner-Id': partnerId.toString()
  }
});

export const goOnline = async (partnerId: number): Promise<PartnerPresenceResponse> => {
  return apiClient.post('/delivery-partners/me/online', undefined, getHeaders(partnerId));
};

export const goOffline = async (partnerId: number): Promise<PartnerPresenceResponse> => {
  return apiClient.post('/delivery-partners/me/offline', undefined, getHeaders(partnerId));
};

export const sendHeartbeat = async (partnerId: number): Promise<void> => {
  return apiClient.post('/delivery-partners/me/heartbeat', undefined, getHeaders(partnerId));
};

export const getMyPresence = async (partnerId: number): Promise<PartnerPresenceResponse> => {
  return apiClient.get('/delivery-partners/me/presence', getHeaders(partnerId));
};

export const getAvailablePartners = async (): Promise<PartnerPresenceResponse[]> => {
  return apiClient.get('/delivery-partners/available');
};

export interface NearbyPartnerResponse {
  partnerId: number;
  distanceKm: number;
}

export const getNearbyPartners = async (
  latitude: number,
  longitude: number,
  radius: number
): Promise<NearbyPartnerResponse[]> => {
  return apiClient.get(`/delivery-partners/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
};

