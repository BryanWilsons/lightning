export const clientTracking = [
  ['9400 1000 0000 0123 4567 89', 'Priority Mail', 'In Transit', 'Tampa, FL', 'Sep 27'],
  ['9400 1000 0000 0198 7654 32', 'Ground Advantage', 'Delivered', 'Pinellas Park, FL', 'Sep 24'],
  ['9400 1000 0000 0155 1122 33', 'Priority Mail Express', 'Delayed', 'Orlando, FL', 'Sep 28'],
  ['9400 1000 0000 0177 3344 55', 'First-Class', 'Delivered', 'St. Petersburg, FL', 'Sep 22'],
];

export const clientAddresses = [
  ['Home', '214 Palmwood Ave, Pinellas Park, FL 33781', 'Default'],
  ['Office', '900 Bayline Dr Suite 4, Tampa, FL 33602', '—'],
  ['Warehouse', '55 Industrial Way, Clearwater, FL 33755', '—'],
];

export const clientInvoices = [
  ['INV-3391', 'Sep 2026', '$128.40', 'Completed'],
  ['INV-3350', 'Aug 2026', '$96.10', 'Completed'],
  ['INV-3312', 'Jul 2026', '$142.75', 'Completed'],
];

export const adminQueue = [
  ['BATCH-2291', 'Tampa Sort Facility', '1,240 pcs', 'Pending', 'Auto-assign'],
  ['BATCH-2288', 'Clearwater Hub', '860 pcs', 'In Transit', '—'],
  ['BATCH-2280', 'St. Pete Annex', '2,015 pcs', 'Delayed', 'Reassign'],
  ['BATCH-2277', 'Largo Depot', '540 pcs', 'Completed', '—'],
];

export const adminStaff = [
  ['J. Alvarez', 'Sorting — Line 3', '6:00a – 2:00p', 'Completed'],
  ['M. Chen', 'Loading Dock', '2:00p – 10:00p', 'In Transit'],
  ['D. Whitfield', 'Route Dispatch', '6:00a – 2:00p', 'Completed'],
  ['S. Osei', 'Sorting — Line 1', '10:00p – 6:00a', 'Pending'],
];

export const adminRoutes = [
  ['RT-14', 'Pinellas County North', '82%'],
  ['RT-09', 'Tampa Downtown', '64%'],
  ['RT-22', 'Clearwater Beach Loop', '91%'],
  ['RT-05', 'Largo / Seminole', '47%'],
];

export const facilities = [
  { name: 'Tampa Sort Facility', vol: '12,400 pcs today', status: 'Online' },
  { name: 'Clearwater Hub', vol: '6,180 pcs today', status: 'Online' },
  { name: 'St. Pete Annex', vol: '3,920 pcs today', status: 'Delayed' },
  { name: 'Largo Depot', vol: '2,050 pcs today', status: 'Offline' },
];

export const throughput = [
  ['Mon', 62],
  ['Tue', 74],
  ['Wed', 58],
  ['Thu', 81],
  ['Fri', 69],
  ['Sat', 40],
];

export const reports = ['Daily throughput', 'Delay analysis', 'Facility utilization', 'Staffing summary'];