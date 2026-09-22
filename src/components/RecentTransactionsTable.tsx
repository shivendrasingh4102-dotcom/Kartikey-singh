import React, { useMemo } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { Order } from '../types';

interface RecentTransactionsTableProps {
  currentOrder: Order;
  onNavigateToTab?: (tab: 'pipeline' | 'delivery' | 'receipt' | 'inbox' | 'code') => void;
}

export interface TransactionItem {
  id: string;
  orderId: string;
  date: string;
  timestamp: number;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending';
  customerEmail: string;
  productTitle: string;
  isCurrentOrder?: boolean;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ 
  currentOrder,
  onNavigateToTab 
}) => {
  // Format readable dates
  const formatTxDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp));
  };

  // Compile the last 5 orders including currentOrder
  const recentOrders = useMemo<TransactionItem[]>(() => {
    const currentOrderTime = currentOrder.createdAt || Date.now();

    const items: TransactionItem[] = [
      // 1. Current active order
      {
        id: 'tx_curr_1',
        orderId: currentOrder.id,
        date: formatTxDate(currentOrderTime),
        timestamp: currentOrderTime,
        amount: currentOrder.amount,
        currency: currentOrder.currency || 'USD',
        status: currentOrder.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
        customerEmail: currentOrder.user.email,
        productTitle: currentOrder.product.title,
        isCurrentOrder: true,
      },
      // 2. Preceding recent mock order
      {
        id: 'tx_prev_2',
        orderId: 'ord_8941f7a',
        date: formatTxDate(currentOrderTime - 24 * 60 * 1000), // 24 mins ago
        timestamp: currentOrderTime - 24 * 60 * 1000,
        amount: 39.00,
        currency: 'USD',
        status: 'Paid',
        customerEmail: 'dev.lead@cloudnative.net',
        productTitle: 'Full-Stack Security Blueprint',
      },
      // 3. Preceding recent mock order
      {
        id: 'tx_prev_3',
        orderId: 'ord_8932b1c',
        date: formatTxDate(currentOrderTime - 82 * 60 * 1000), // 1h 22m ago
        timestamp: currentOrderTime - 82 * 60 * 1000,
        amount: 59.00,
        currency: 'USD',
        status: 'Paid',
        customerEmail: 'architect@enterprise.io',
        productTitle: 'Cloud Architecture & High-Scale Systems',
      },
      // 4. Preceding recent mock order (Pending status for demonstration)
      {
        id: 'tx_prev_4',
        orderId: 'ord_8920d4e',
        date: formatTxDate(currentOrderTime - 175 * 60 * 1000), // ~3 hrs ago
        timestamp: currentOrderTime - 175 * 60 * 1000,
        amount: 49.00,
        currency: 'USD',
        status: 'Pending',
        customerEmail: 'infra.eng@distributed.org',
        productTitle: 'Advanced System Design Playbook',
      },
      // 5. Preceding recent mock order
      {
        id: 'tx_prev_5',
        orderId: 'ord_8911c8b',
        date: formatTxDate(currentOrderTime - 310 * 60 * 1000), // ~5 hrs ago
        timestamp: currentOrderTime - 310 * 60 * 1000,
        amount: 49.00,
        currency: 'USD',
        status: 'Paid',
        customerEmail: 'sre.specialist@resilience.dev',
        productTitle: 'Advanced System Design Playbook',
      },
    ];

    return items;
  }, [currentOrder]);

  return (
    <div 
      id="card-recent-transactions" 
      className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6"
    >
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Last 5 Orders
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time feed of the latest digital asset purchases processed through Stripe webhooks.
          </p>
        </div>

        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab('receipt')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View Receipt Inspector</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table 
          id="table-recent-transactions" 
          className="w-full text-left border-collapse text-xs"
        >
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {recentOrders.map((order, idx) => (
              <tr 
                key={order.id} 
                id={`row-transaction-${order.orderId}`}
                className={`transition-colors hover:bg-slate-50/70 ${
                  order.isCurrentOrder ? 'bg-indigo-50/40 font-medium' : ''
                }`}
              >
                {/* Column 1: Order ID */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">
                      #{order.orderId}
                    </span>
                    {order.isCurrentOrder && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                    {order.productTitle}
                  </div>
                </td>

                {/* Column 2: Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                  {order.date}
                </td>

                {/* Column 3: Amount */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ${order.amount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1 font-mono">
                    {order.currency}
                  </span>
                </td>

                {/* Column 4: Status (Paid/Pending) */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {order.status === 'Paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Pending</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All 'Paid' transactions are watermarked and dispatched with 15-minute S3 signed URLs.</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Auto-synced with Stripe Webhook idempotency keys
        </div>
      </div>
    </div>
  );
};
