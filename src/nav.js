import { ICONS } from './components/Icon.js';

export const NAV = {
  client: [
    // { path: 'overview', label: 'Overviewf', icon: ICONS.home },
    // { path: 'track', label: 'Track mail', icon: ICONS.package },
    // { path: 'pickups', label: 'Pickups', icon: ICONS.truck },
    // { path: 'addresses', label: 'Address book', icon: ICONS.pin },
    { path: 'billing', label: 'Billing', icon: ICONS.card },
   // { path: 'support', label: 'Support', icon: ICONS.life },
  ],
  admin: [
    { path: 'overview', label: 'Overviewf', icon: ICONS.home },
    { path: 'queue', label: 'Intake queue', icon: ICONS.inbox },
    { path: 'routing', label: 'Routing', icon: ICONS.route },
    { path: 'facilities', label: 'Facilities', icon: ICONS.building },
    { path: 'staff', label: 'Staff', icon: ICONS.users },
    { path: 'reports', label: 'Reports', icon: ICONS.chart },
  ],
};