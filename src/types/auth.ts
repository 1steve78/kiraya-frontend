// types/auth.ts
export type UserRole =
  | 'CUSTOMER'
  | 'SHOP_OWNER'
  | 'SHOP_STAFF'
  | 'DELIVERY_PARTNER'
  | 'ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  shopId?: number;
}
