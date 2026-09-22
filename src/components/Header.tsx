import React from 'react';
import { Shield, Sparkles, CreditCard, RefreshCw, Terminal, Globe, BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';

export type AppTab = 'store' | 'pipeline' | 'delivery' | 'receipt' | 'inbox' | 'code';

interface HeaderProps {
  currentOrder: Order;
  isProcessing: boolean;
  onNewCheckout: () => void;
  onReplayPipeline: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  unreadInboxCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentOrder,
  isProcessing,
  onNewCheckout,
  onReplayPipeline,
  activeTab,
  setActiveTab,
  unreadInboxCount,
}) => {
  const isStoreActive = activeTab === 'store';

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('store')}
              className="text-left flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-900 transition-colors">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Kartikey Singh
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
                    PUBLICATIONS
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Cloud Native Microservices Architecture • Secure Delivery Platform
                </p>
              </div>
            </button>
          </div>

          {/* Top Mode Switcher & Primary Action */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Main Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                id="btn-mode-storefront"
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isStoreActive
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Storefront Website
              </button>

              <button
                id="btn-mode-pipeline"
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isStoreActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Fulfillment Engine
              </button>
            </div>

            {/* Quick Action Button */}
            {isStoreActive ? (
              <button
                id="btn-header-buy"
                onClick={onNewCheckout}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Buy E-Book ($49)
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-replay-pipeline"
                  onClick={onReplayPipeline}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="Re-run post-payment webhook workflow for current order"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  Re-run Webhook
                </button>

                <button
                  id="btn-simulate-checkout"
                  onClick={onNewCheckout}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Simulate Checkout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation (Contextual) */}
        <div className="flex items-center gap-1 mt-3 border-t border-slate-100 pt-2 overflow-x-auto text-xs font-medium text-slate-600">
          {isStoreActive ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Book Overview &amp; Store
                </button>
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 flex items-center gap-1.5"
                >
                  <span>Customer Inbox</span>
                  {unreadInboxCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      {unreadInboxCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('receipt')}
                  className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Tax Receipt Preview
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active 15-min S3 Delivery Gateway</span>
              </div>
            </div>
          ) : (
            <>
              <button
                id="tab-pipeline"
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'pipeline'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Architecture &amp; Flow
              </button>

              <button
                id="tab-delivery"
                onClick={() => setActiveTab('delivery')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'delivery'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                1. Secure Delivery (Signed URL &amp; Watermark)
              </button>

              <button
                id="tab-receipt"
                onClick={() => setActiveTab('receipt')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'receipt'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                2. Receipt Generation
              </button>

              <button
                id="tab-inbox"
                onClick={() => setActiveTab('inbox')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'inbox'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="relative flex items-center gap-1.5">
                  Customer Inbox
                  {unreadInboxCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      {unreadInboxCount}
                    </span>
                  )}
                </span>
              </button>

              <button
                id="tab-code"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Source Code (route.ts &amp; lib)
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

