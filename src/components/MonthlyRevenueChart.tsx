import React, { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Layers, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  BarChart3, 
  Activity 
} from 'lucide-react';
import { Order } from '../types';
import { getComparativeMonthlyFinancials } from '../data/mockOrders';

interface MonthlyRevenueChartProps {
  currentOrder: Order;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ currentOrder }) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'velocity'>('revenue');

  // Compute comparative financials
  const comparativeData = useMemo(() => {
    return getComparativeMonthlyFinancials(currentOrder);
  }, [currentOrder]);

  const { 
    records, 
    sevenDayDailyAvgVolume, 
    sevenDayDailyAvgRevenue, 
    historicalDailyAvgVolume, 
    volumeVelocityIncreasePct 
  } = comparativeData;

  // Cumulative all-time 8-month revenue
  const total8MonthRevenue = useMemo(() => {
    return records.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [records]);

  // Current month record
  const currentMonthRecord = useMemo(() => {
    return records.find((r) => r.isCurrentMonth) || records[records.length - 1];
  }, [records]);

  // Custom Recharts Tooltip
  const CustomMonthlyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[220px] pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-200">{data.month}</span>
            {data.isCurrentMonth && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CURRENT (MTD)
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Monthly Revenue:</span>
              <span className="font-bold text-white font-mono">${data.revenue.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Monthly Copies:</span>
              <span className="font-bold text-slate-200 font-mono">{data.orderVolume.toLocaleString()} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Daily Volume:</span>
              <span className="font-bold text-emerald-400 font-mono">{data.avgDailyVolume} copies/day</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">vs 7-Day Velocity:</span>
              <span className={`font-mono font-semibold ${sevenDayDailyAvgVolume >= data.avgDailyVolume ? 'text-indigo-400' : 'text-slate-300'}`}>
                {sevenDayDailyAvgVolume >= data.avgDailyVolume 
                  ? `+${Math.round(((sevenDayDailyAvgVolume - data.avgDailyVolume) / data.avgDailyVolume) * 100)}% surge`
                  : 'Comparable'}
              </span>
            </div>
          </div>

          {data.isCurrentMonth && currentOrder.paymentStatus === 'PAID' && (
            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Includes active order #{currentOrder.id}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Monthly Revenue Trends vs. 7-Day Volume
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Macro financial trajectory across 8 months compared to the current 7-day daily fulfillment velocity.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'revenue'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Monthly Revenue ($)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('velocity')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'velocity'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Daily Velocity Comparison
          </button>
        </div>
      </div>

      {/* Comparative Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">8-Month Total</span>
          <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
            ${total8MonthRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            Cumulative Gross USD
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current 7-Day Velocity</span>
          <div className="text-lg font-black text-indigo-600 font-mono mt-0.5">
            {sevenDayDailyAvgVolume} <span className="text-xs font-normal text-slate-500">copies/day</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            +{volumeVelocityIncreasePct}% vs baseline
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Sep 2026 MTD</span>
          <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">
            ${currentMonthRecord.revenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5">
            {currentMonthRecord.orderVolume} units MTD
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-500">7-Day Daily Run-Rate</span>
          <div className="text-base sm:text-lg font-bold text-indigo-950 font-mono mt-0.5">
            ${sevenDayDailyAvgRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">/day</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-amber-500" />
            ${Math.round(sevenDayDailyAvgRevenue * 30).toLocaleString()}/mo run-rate
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-2">
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'revenue' ? (
              <AreaChart 
                data={records} 
                margin={{ top: 16, right: 16, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="monthlyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="shortMonth" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={<CustomMonthlyTooltip />} 
                  cursor={{ stroke: '#6366F1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <ReferenceLine 
                  y={Math.round(sevenDayDailyAvgRevenue * 30)} 
                  stroke="#10B981" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `7-Day Run-Rate: $${(Math.round(sevenDayDailyAvgRevenue * 30) / 1000).toFixed(0)}k/mo`, 
                    fill: '#059669', 
                    fontSize: 10, 
                    position: 'insideTopLeft' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#monthlyRevenueGradient)" 
                  animationDuration={800}
                />
              </AreaChart>
            ) : (
              <BarChart 
                data={records} 
                margin={{ top: 20, right: 16, left: -16, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="shortMonth" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  tickFormatter={(val) => `${val}/d`}
                />
                <Tooltip 
                  content={<CustomMonthlyTooltip />} 
                  cursor={{ fill: '#F1F5F9', opacity: 0.7 }}
                />
                {/* Benchmark line showing Current 7-Day Daily Volume */}
                <ReferenceLine 
                  y={sevenDayDailyAvgVolume} 
                  stroke="#4F46E5" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ 
                    value: `Current 7-Day Velocity: ${sevenDayDailyAvgVolume} copies/day`, 
                    fill: '#4338CA', 
                    fontSize: 11, 
                    position: 'insideTopRight' 
                  }} 
                />
                <Bar 
                  dataKey="avgDailyVolume" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={40}
                  animationDuration={600}
                >
                  {records.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrentMonth ? '#4F46E5' : '#94A3B8'} 
                      className="transition-colors hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Insights Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#4F46E5]"></span>
            <span className="font-semibold text-slate-700">Monthly Trajectory (Feb - Sep 2026)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500"></span>
            <span className="text-emerald-700 font-medium">
              Current 7-Day Run-Rate: {sevenDayDailyAvgVolume} copies/day (${sevenDayDailyAvgRevenue}/day)
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Normalized for 30-day run rate &amp; Stripe reconciliation
        </div>
      </div>

    </div>
  );
};
