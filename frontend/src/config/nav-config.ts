import { NavItem } from '@/types';

export const personalNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'My Card',
    url: '/dashboard/my-card',
    icon: 'card',
    isActive: false,
    shortcut: ['m', 'c'],
    items: []
  },

  {
    title: 'Subscriptions',
    url: '/dashboard/subscriptions',
    icon: 'subscriptions',
    isActive: false,
    shortcut: ['s', 's'],
    items: []
  },
  {
    title: 'Activity',
    url: '/dashboard/activity',
    icon: 'activity',
    isActive: false,
    shortcut: ['a', 'a'],
    items: []
  }
];

export const merchantNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'b'],
    items: []
  },
  {
    title: 'My Card',
    url: '/dashboard/my-card',
    icon: 'card',
    isActive: false,
    shortcut: ['m', 'c'],
    items: []
  },
  {
    title: 'Subscribers',
    url: '/merchant/subscriptions',
    icon: 'subscriptions',
    isActive: false,
    shortcut: ['m', 's'],
    items: []
  },
  {
    title: 'Billing',
    url: '/merchant/billing-cycles',
    icon: 'billing',
    isActive: false,
    shortcut: ['m', 'b'],
    items: []
  },
  {
    title: 'Recovery',
    url: '/merchant/recovery',
    icon: 'warning',
    isActive: false,
    shortcut: ['m', 'r'],
    items: []
  },
  {
    title: 'Customers',
    url: '/merchant/customers',
    icon: 'teams',
    isActive: false,
    shortcut: ['m', 'c'],
    items: []
  },
  {
    title: 'Payouts',
    url: '/merchant/payouts',
    icon: 'receive',
    isActive: false,
    shortcut: ['m', 'p'],
    items: []
  },
  {
    title: 'Contract Controls',
    url: '/merchant/contracts',
    icon: 'settings',
    isActive: false,
    shortcut: ['m', 'k'],
    items: []
  },
  {
    title: 'Integration',
    url: '/merchant/integration',
    icon: 'workspace',
    isActive: false,
    shortcut: ['m', 'i'],
    items: []
  }
];

export const navItems = personalNavItems; // fallback
