import {
  Home,
  Search,
  Package,
  User,
  LayoutDashboard,
  ListOrdered,
  ShoppingBag,
  Tags,
  Settings,
  Truck,
  MapPin,
  Clock,
  Shield,
  Store,
  LucideIcon
} from 'lucide-react';
import { UserRole } from '@/types/auth';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const NAVIGATION_CONFIG: Record<UserRole, NavItem[]> = {
  CUSTOMER: [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Browse', href: '/browse', icon: Search },
    { name: 'My Orders', href: '/orders', icon: Package },
    { name: 'Profile', href: '/profile', icon: User },
  ],
  SHOP_OWNER: [
    { name: 'Dashboard', href: '/shop/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/shop/dashboard/orders', icon: ListOrdered },
    { name: 'Products', href: '/shop/dashboard/products', icon: ShoppingBag },
    { name: 'Categories', href: '/shop/dashboard/categories', icon: Tags },
    { name: 'Settings', href: '/shop/dashboard/settings', icon: Settings },
  ],
  SHOP_STAFF: [
    { name: 'Dashboard', href: '/shop/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/shop/dashboard/orders', icon: ListOrdered },
    { name: 'Products', href: '/shop/dashboard/products', icon: ShoppingBag },
  ],
  DELIVERY_PARTNER: [
    { name: 'Dashboard', href: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'Available Deliveries', href: '/delivery/available', icon: Package },
    { name: 'Active Delivery', href: '/delivery/active', icon: MapPin },
    { name: 'History', href: '/delivery/history', icon: Clock },
    { name: 'Profile', href: '/delivery/profile', icon: User },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Shops', href: '/admin/shops', icon: Store },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'System', href: '/admin/system', icon: Shield },
  ],
};

export function getNavigationForRole(role?: UserRole): NavItem[] {
  if (!role) return [];
  return NAVIGATION_CONFIG[role] || [];
}
