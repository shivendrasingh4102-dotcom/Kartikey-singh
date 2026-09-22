import React from 'react';
import { 
  CreditCard, 
  Webhook, 
  Lock, 
  FileCheck, 
  Mail, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  ArrowDown, 
  ChevronRight, 
  Download,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Order, PipelineExecutionState } from '../types';

interface ArchitectureFlowProps {
  order: Order;
  pipelineState: PipelineExecutionState;
  onNavigateToTab: (tab: 'delivery' | 'receipt' | 'inbox' | 'code') => void;
  onTriggerDownload: () => void;
  onTriggerReceiptDownload: () => void;
  isGeneratingPdf: boolean;
}

export const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({
  order,
  pipelineState,
  onNavigateToTab,
  onTriggerDownload,
  onTriggerReceiptDownload,
  isGeneratingPdf,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Active Order Context */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Active Fulfillment Session
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              Order ID: #{order.id}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {order.product.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customer: <span className="text-white font-medium">{order.user.email}</span> • Amount: <span className="text-white font-medium">${order.product.price.toFixed(2)} {order.currency}</span> • Gateway: Stripe ({order.sessionId.substring(0, 16)}...)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('inbox')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Check Delivered Emails
          </button>
          <button
            onClick={onTriggerDownload}
            disabled={isGeneratingPdf}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {isGeneratingPdf ? 'Processing PDF...' : 'Instant Download Watermarked'}
          </button>
        </div>
      </div>

      {/* Main Architecture Diagram Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Event-Driven Post-Payment Architecture
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict parallel execution fork triggered upon <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono text-[11px]">checkout.session.completed</code>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Fulfilled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Streaming
            </span>
          </div>
        </div>

        {/* Diagram Flow Container */}
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Node 1: Customer Completes Payment */}
          <div 
            id="node-payment"
            className="w-full max-w-md bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl p-4 transition-all shadow-xs text-center relative group"
          >
            <div className="flex items-center justify-center gap-2 font-bold text-slate-900 text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Customer Completes Payment</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Buyer submits checkout details via Stripe Hosted Checkout or Custom Elements.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Payment Intent Succeeded: ${order.product.price.toFixed(2)}
            </div>
          </div>

          {/* Connector Down */}
          <div className="h-8 w-0.5 bg-slate-300 relative my-1">
            <div className="absolute -bottom-1 -left-1 text-slate-400">
              <ArrowDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Node 2: Payment Gateway Webhook */}
          <div 
            id="node-webhook"
            className="w-full max-w-lg bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 transition-all shadow-xs text-center relative"
          >
            <div className="flex items-center justify-center gap-2 font-bold text-indigo-950 text-sm">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Webhook className="w-4 h-4" />
              </div>
              <span>Payment Gateway Webhook (checkout.session.completed)</span>
            </div>
            <p className="text-xs text-indigo-900/80 mt-1 max-w-md mx-auto">
              Cryptographic signature verified with HMAC SHA-256. Webhook orchestrator triggers parallel delivery &amp; receipt jobs.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px]">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-slate-700">
                stripe-signature: verified
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-slate-700">
                order.paymentStatus = 'PAID'
              </span>
            </div>
          </div>

          {/* Fork Splitter Graphic */}
          <div className="w-full max-w-2xl py-3 flex flex-col items-center">
            {/* Center stem down */}
            <div className="h-5 w-0.5 bg-slate-300"></div>
            {/* Horizontal T-bar */}
            <div className="w-3/4 h-0.5 bg-slate-300 relative">
              {/* Left drop down */}
              <div className="absolute left-0 top-0 h-6 w-0.5 bg-slate-300">
                <div className="absolute -bottom-1 -left-1 text-slate-400">
                  <ArrowDown className="w-3 h-3" />
                </div>
              </div>
              {/* Right drop down */}
              <div className="absolute right-0 top-0 h-6 w-0.5 bg-slate-300">
                <div className="absolute -bottom-1 -left-1 text-slate-400">
                  <ArrowDown className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="h-4"></div>
          </div>

          {/* Dual Parallel Branches Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
            
            {/* BRANCH 1: SECURE DELIVERY */}
            <div 
              id="branch-secure-delivery"
              className="bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">1. Secure Delivery</h4>
                      <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded">
                        lib/storage.ts &amp; route.ts
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    Branch Active
                  </span>
                </div>

                {/* Sub-steps */}
                <div className="space-y-3 pl-2 border-l-2 border-blue-200 mt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Generate 15-min Signed URL</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Private S3 Bucket with <code className="text-slate-700 font-mono text-[10px]">expiresIn: 900</code> (AWS SigV4). Direct link expires after 15 minutes to prevent hotlink sharing.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Stream PDF / Apply Watermark</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Intercepted by <code className="text-slate-700 font-mono text-[10px]">pdf-lib</code> in API route. Stamps <span className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded text-[10px]">Licensed to {order.user.email} | Order #{order.id}</span> on every page.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Email with Download Link</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Sends clean access button with expiration warning countdown directly to <span className="font-medium text-slate-700">{order.user.email}</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch 1 Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateToTab('delivery')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Configure Watermark &amp; Presign
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={onTriggerDownload}
                  disabled={isGeneratingPdf}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Test Download
                </button>
              </div>
            </div>

            {/* BRANCH 2: RECEIPT GENERATION */}
            <div 
              id="branch-receipt-gen"
              className="bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">2. Receipt Generation</h4>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                        lib/receipt.ts &amp; Resend / SendGrid
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    Branch Active
                  </span>
                </div>

                {/* Sub-steps */}
                <div className="space-y-3 pl-2 border-l-2 border-emerald-200 mt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Render HTML Receipt Template</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Compiles responsive tax receipt with merchant VAT, itemized line items, estimated tax ($3.22), and payment card summary.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Convert to PDF (Puppeteer / PDFKit)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Renders immutable vectorized A4 invoice document with anti-tamper verification hash.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Attach PDF &amp; Send via Resend/SendGrid</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">
                      Delivers customer confirmation email with 15-min expiring download link and attached <code className="text-slate-700 font-mono text-[10px]">Receipt-{order.id}.pdf</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch 2 Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateToTab('receipt')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  View Template &amp; Invoice
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={onTriggerReceiptDownload}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download Receipt PDF
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Security Architectural Principles Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Zero Public Bucket Exposure</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The master product PDF is never stored on a public CDN or static URL. Presigned URLs require explicit HMAC authorization and expire automatically after 900 seconds.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Tamper-Evident Watermarking</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every page of the streamed PDF embeds the customer email and order ID. In case of leaks to torrent sites or forums, forensic attribution points directly to the buyer.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Dual Asynchronous Dispatch</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Delivery and accounting execute independently using <code className="font-mono text-slate-700 text-[11px]">Promise.allSettled</code>, guaranteeing receipt generation even during downstream storage latency.
          </p>
        </div>
      </div>
    </div>
  );
};
