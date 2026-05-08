import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Hammer,
  LayoutGrid,
  Map,
  MessageCircle,
  Package,
  Search,
  Settings,
  Shield,
  User,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';

const ic = (El) => <El className="h-4 w-4" />;

export const tenantNav = [
  {
    title: 'Tenant',
    items: [
      { to: '/tenant', label: 'Dashboard', icon: ic(LayoutGrid), end: true },
      { to: '/tenant/browse', label: 'Browse Properties', icon: ic(Search) },
      { to: '/tenant/lease', label: 'My Lease', icon: ic(FileText) },
      { to: '/tenant/maintenance', label: 'Maintenance', icon: ic(Wrench) },
      { to: '/tenant/analytics', label: 'Analytics', icon: ic(BarChart3) },
      { to: '/tenant/messages', label: 'Messages', icon: ic(MessageCircle) },
      { to: '/tenant/notifications', label: 'Notifications', icon: ic(Bell) },
      { to: '/tenant/profile', label: 'Profile', icon: ic(User) },
    ],
  },
];

export const landlordNav = [
  {
    title: 'Landlord',
    items: [
      { to: '/landlord', label: 'Dashboard', icon: ic(LayoutGrid), end: true },
      { to: '/landlord/properties', label: 'My Properties', icon: ic(Building2) },
      { to: '/landlord/tenants', label: 'Tenants', icon: ic(Users) },
      { to: '/landlord/maintenance', label: 'Maintenance', icon: ic(Hammer) },
      { to: '/landlord/payments', label: 'Payments & Revenue', icon: ic(Wallet) },
      { to: '/landlord/messages', label: 'Messages', icon: ic(MessageCircle) },
      { to: '/landlord/acknowledgements', label: 'Acknowledgements', icon: ic(Shield) },
      { to: '/landlord/notifications', label: 'Notifications', icon: ic(Bell) },
      { to: '/landlord/profile', label: 'Profile', icon: ic(User) },
    ],
  },
  {
    title: 'Records',
    items: [
      { to: '/landlord/analytics', label: 'Analytics', icon: ic(BarChart3) },
      { to: '/landlord/map', label: 'Map View', icon: ic(Map) },
      { to: '/landlord/inventory', label: 'Inventory', icon: ic(Package) },
    ],
  },
];

export const adminNav = [
  {
    title: 'Admin',
    items: [
      { to: '/admin', label: 'Dashboard', icon: ic(LayoutGrid), end: true },
      { to: '/admin/users', label: 'Users', icon: ic(Users) },
      { to: '/admin/properties', label: 'Properties', icon: ic(Building2) },
      { to: '/admin/leases', label: 'Lease Management', icon: ic(FileText) },
      { to: '/admin/payments', label: 'Payments', icon: ic(CreditCard) },
      { to: '/admin/maintenance', label: 'Maintenance', icon: ic(Wrench) },
      { to: '/admin/analytics', label: 'Analytics', icon: ic(BarChart3) },
      { to: '/admin/settings', label: 'Settings', icon: ic(Settings) },
    ],
  },
];

export const navByRole = {
  tenant: tenantNav,
  landlord: landlordNav,
  admin: adminNav,
};
