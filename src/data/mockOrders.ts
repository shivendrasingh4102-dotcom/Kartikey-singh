import { Order } from '../types';
import { SAMPLE_PRODUCTS } from './mockProducts';

export interface HistoricalMockOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  amount: number;
  daysAgo: number;
  paymentStatus: 'PAID';
}

// Fixed realistic historical mock orders across the last 7 days
export const BASE_HISTORICAL_ORDERS: HistoricalMockOrder[] = [
  // Day -6 (24 orders)
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `ord_hist_6_${i + 1}`,
    customerName: `Customer 6-${i + 1}`,
    customerEmail: `architect.6.${i + 1}@enterprise.io`,
    productTitle: SAMPLE_PRODUCTS[0].title,
    amount: 49.00,
    daysAgo: 6,
    paymentStatus: 'PAID' as const,
  })),
  // Day -5 (31 orders)
  ...Array.from({ length: 31 }, (_, i) => ({
    id: `ord_hist_5_${i + 1}`,
    customerName: `Customer 5-${i + 1}`,
    customerEmail: `dev.5.${i + 1}@cloudnative.net`,
    productTitle: i % 3 === 0 ? SAMPLE_PRODUCTS[2].title : SAMPLE_PRODUCTS[0].title,
    amount: i % 3 === 0 ? 59.00 : 49.00,
    daysAgo: 5,
    paymentStatus: 'PAID' as const,
  })),
  // Day -4 (38 orders)
  ...Array.from({ length: 38 }, (_, i) => ({
    id: `ord_hist_4_${i + 1}`,
    customerName: `Customer 4-${i + 1}`,
    customerEmail: `engineer.4.${i + 1}@distributed.org`,
    productTitle: i % 4 === 0 ? SAMPLE_PRODUCTS[1].title : SAMPLE_PRODUCTS[0].title,
    amount: i % 4 === 0 ? 39.00 : 49.00,
    daysAgo: 4,
    paymentStatus: 'PAID' as const,
  })),
  // Day -3 (29 orders)
  ...Array.from({ length: 29 }, (_, i) => ({
    id: `ord_hist_3_${i + 1}`,
    customerName: `Customer 3-${i + 1}`,
    customerEmail: `infra.3.${i + 1}@k8s-scale.tech`,
    productTitle: SAMPLE_PRODUCTS[0].title,
    amount: 49.00,
    daysAgo: 3,
    paymentStatus: 'PAID' as const,
  })),
  // Day -2 (45 orders)
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `ord_hist_2_${i + 1}`,
    customerName: `Customer 2-${i + 1}`,
    customerEmail: `lead.2.${i + 1}@microservices.co`,
    productTitle: i % 5 === 0 ? SAMPLE_PRODUCTS[2].title : SAMPLE_PRODUCTS[0].title,
    amount: i % 5 === 0 ? 59.00 : 49.00,
    daysAgo: 2,
    paymentStatus: 'PAID' as const,
  })),
  // Day -1 (52 orders)
  ...Array.from({ length: 52 }, (_, i) => ({
    id: `ord_hist_1_${i + 1}`,
    customerName: `Customer 1-${i + 1}`,
    customerEmail: `principal.1.${i + 1}@systemdesign.io`,
    productTitle: i % 2 === 0 ? SAMPLE_PRODUCTS[0].title : SAMPLE_PRODUCTS[1].title,
    amount: i % 2 === 0 ? 49.00 : 39.00,
    daysAgo: 1,
    paymentStatus: 'PAID' as const,
  })),
  // Day 0 / Today (41 baseline orders before current order)
  ...Array.from({ length: 41 }, (_, i) => ({
    id: `ord_hist_0_${i + 1}`,
    customerName: `Customer 0-${i + 1}`,
    customerEmail: `sre.0.${i + 1}@resilience.dev`,
    productTitle: SAMPLE_PRODUCTS[0].title,
    amount: 49.00,
    daysAgo: 0,
    paymentStatus: 'PAID' as const,
  })),
];

export interface CumulativeOrderStats {
  totalRevenue: number;
  totalOrders: number;
  allTimeRevenue: number;
  allTimeOrders: number;
  sevenDayRevenue: number;
  sevenDayOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  growthRatePercent: number;
}

/**
 * Calculates cumulative stats across all mock orders stored in the application,
 * including historical monthly orders, 7-day granular orders, and live currentOrder.
 */
export function calculateCumulativeOrderStats(currentOrder?: Order): CumulativeOrderStats {
  // 1. Calculate granular 7-day order totals
  let sevenDayRevenue = 0;
  let sevenDayOrders = 0;
  let todayRevenue = 0;
  let todayOrders = 0;

  for (const o of BASE_HISTORICAL_ORDERS) {
    if (o.paymentStatus === 'PAID') {
      sevenDayRevenue += o.amount;
      sevenDayOrders += 1;
      if (o.daysAgo === 0) {
        todayRevenue += o.amount;
        todayOrders += 1;
      }
    }
  }

  // 2. Calculate all-time monthly orders stored in the app
  let allTimeHistoricalRevenue = BASE_MONTHLY_FINANCIALS.reduce((sum, m) => sum + m.revenue, 0);
  let allTimeHistoricalOrders = BASE_MONTHLY_FINANCIALS.reduce((sum, m) => sum + m.orderVolume, 0);

  // 3. Add live active current order if paid
  if (currentOrder && currentOrder.paymentStatus === 'PAID') {
    sevenDayRevenue += currentOrder.amount;
    sevenDayOrders += 1;
    todayRevenue += currentOrder.amount;
    todayOrders += 1;
    allTimeHistoricalRevenue += currentOrder.amount;
    allTimeHistoricalOrders += 1;
  }

  const allTimeRevenue = allTimeHistoricalRevenue;
  const allTimeOrders = allTimeHistoricalOrders;
  const averageOrderValue = allTimeOrders > 0 ? allTimeRevenue / allTimeOrders : 49.00;
  const growthRatePercent = 14.8; // Rolling 7-day volume increase

  return {
    totalRevenue: allTimeRevenue,
    totalOrders: allTimeOrders,
    allTimeRevenue,
    allTimeOrders,
    sevenDayRevenue,
    sevenDayOrders,
    averageOrderValue,
    todayRevenue,
    todayOrders,
    growthRatePercent,
  };
}

export interface MonthlyFinancialRecord {
  month: string;
  shortMonth: string;
  revenue: number;
  orderVolume: number;
  avgDailyVolume: number;
  avgDailyRevenue: number;
  growthVsPrevious: number;
  isCurrentMonth?: boolean;
}

export const BASE_MONTHLY_FINANCIALS: MonthlyFinancialRecord[] = [
  {
    month: 'February 2026',
    shortMonth: 'Feb',
    revenue: 20188,
    orderVolume: 412,
    avgDailyVolume: 14.7,
    avgDailyRevenue: 721,
    growthVsPrevious: 0,
  },
  {
    month: 'March 2026',
    shortMonth: 'Mar',
    revenue: 25382,
    orderVolume: 518,
    avgDailyVolume: 16.7,
    avgDailyRevenue: 818,
    growthVsPrevious: 25.7,
  },
  {
    month: 'April 2026',
    shortMonth: 'Apr',
    revenue: 30625,
    orderVolume: 625,
    avgDailyVolume: 20.8,
    avgDailyRevenue: 1020,
    growthVsPrevious: 20.7,
  },
  {
    month: 'May 2026',
    shortMonth: 'May',
    revenue: 36358,
    orderVolume: 742,
    avgDailyVolume: 23.9,
    avgDailyRevenue: 1172,
    growthVsPrevious: 18.7,
  },
  {
    month: 'June 2026',
    shortMonth: 'Jun',
    revenue: 42385,
    orderVolume: 865,
    avgDailyVolume: 28.8,
    avgDailyRevenue: 1412,
    growthVsPrevious: 16.6,
  },
  {
    month: 'July 2026',
    shortMonth: 'Jul',
    revenue: 48706,
    orderVolume: 994,
    avgDailyVolume: 32.1,
    avgDailyRevenue: 1571,
    growthVsPrevious: 14.9,
  },
  {
    month: 'August 2026',
    shortMonth: 'Aug',
    revenue: 55860,
    orderVolume: 1140,
    avgDailyVolume: 36.8,
    avgDailyRevenue: 1802,
    growthVsPrevious: 14.7,
  },
  {
    month: 'September 2026',
    shortMonth: 'Sep (MTD)',
    revenue: 58450, // Base MTD before current 7-day adjustment
    orderVolume: 1192,
    avgDailyVolume: 39.7,
    avgDailyRevenue: 1948,
    growthVsPrevious: 16.2,
    isCurrentMonth: true,
  },
];

/**
 * Returns dynamic monthly records integrating the live current order and computing comparison against 7-day velocity
 */
export function getComparativeMonthlyFinancials(currentOrder?: Order) {
  const currentCumulative = calculateCumulativeOrderStats(currentOrder);
  // Current 7-day average daily volume and revenue
  const sevenDayDailyAvgVolume = currentCumulative.totalOrders / 7;
  const sevenDayDailyAvgRevenue = currentCumulative.totalRevenue / 7;

  const records = BASE_MONTHLY_FINANCIALS.map((rec) => {
    if (rec.isCurrentMonth) {
      // Dynamic MTD revenue and volume incorporating current active order
      const addedRevenue = currentOrder && currentOrder.paymentStatus === 'PAID' ? currentOrder.amount : 0;
      const addedOrders = currentOrder && currentOrder.paymentStatus === 'PAID' ? 1 : 0;
      const dynamicRevenue = rec.revenue + addedRevenue;
      const dynamicVolume = rec.orderVolume + addedOrders;
      return {
        ...rec,
        revenue: dynamicRevenue,
        orderVolume: dynamicVolume,
        current7DayDailyVolume: Math.round(sevenDayDailyAvgVolume * 10) / 10,
        current7DayDailyRevenue: Math.round(sevenDayDailyAvgRevenue),
      };
    }
    return {
      ...rec,
      current7DayDailyVolume: Math.round(sevenDayDailyAvgVolume * 10) / 10,
      current7DayDailyRevenue: Math.round(sevenDayDailyAvgRevenue),
    };
  });

  return {
    records,
    sevenDayDailyAvgVolume: Math.round(sevenDayDailyAvgVolume * 10) / 10,
    sevenDayDailyAvgRevenue: Math.round(sevenDayDailyAvgRevenue),
    historicalDailyAvgVolume: 24.2, // Baseline from Feb-Jul
    historicalDailyAvgRevenue: 1185,
    volumeVelocityIncreasePct: Math.round(((sevenDayDailyAvgVolume - 24.2) / 24.2) * 100),
  };
}

