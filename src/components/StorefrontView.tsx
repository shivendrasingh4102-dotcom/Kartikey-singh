import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Shield, 
  Download, 
  Clock, 
  CheckCircle2, 
  Star, 
  ChevronRight, 
  FileText, 
  Lock, 
  Code2, 
  Zap, 
  Sparkles, 
  UserCheck, 
  ArrowRight,
  ExternalLink,
  Layers,
  Cpu,
  Mail,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Order, Product, SignedUrlConfig, WatermarkConfig } from '../types';
import { SampleReaderModal } from './SampleReaderModal';
import { OrderVolumeChart } from './OrderVolumeChart';
import { MonthlyRevenueChart } from './MonthlyRevenueChart';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { calculateCumulativeOrderStats } from '../data/mockOrders';

interface StorefrontViewProps {
  currentOrder: Order;
  signedUrlConfig: SignedUrlConfig;
  watermarkConfig: WatermarkConfig;
  onOpenCheckout: (product?: Product) => void;
  onTriggerDownload: () => void;
  onTriggerReceiptDownload: () => void;
  onNavigateToTab: (tab: 'pipeline' | 'delivery' | 'receipt' | 'inbox' | 'code') => void;
  isGeneratingPdf: boolean;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  currentOrder,
  signedUrlConfig,
  watermarkConfig,
  onOpenCheckout,
  onTriggerDownload,
  onTriggerReceiptDownload,
  onNavigateToTab,
  isGeneratingPdf,
}) => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'standard' | 'bundle' | 'team'>('standard');
  const [financialTab, setFinancialTab] = useState<'both' | 'monthly' | 'daily'>('both');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return Math.max(0, Math.floor((signedUrlConfig.expiresAt - Date.now()) / 1000));
  });

  // Calculate cumulative revenue & stats across mock order history including currentOrder
  const cumulativeStats = useMemo(() => {
    return calculateCumulativeOrderStats(currentOrder);
  }, [currentOrder]);

  // Keep countdown updated
  React.useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((signedUrlConfig.expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [signedUrlConfig.expiresAt]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOrderRecent = Date.now() - currentOrder.createdAt < 1000 * 60 * 60 * 24; // within 24 hours

  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      
      {/* 🌟 Top of StorefrontView: Total Revenue Summary Card */}
      <section 
        id="top-total-revenue-summary-card"
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden"
      >
        {/* Ambient accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Primary Revenue Display */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Total Storefront Revenue
              </span>
              <span className="text-xs text-indigo-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Cumulative Value • All {cumulativeStats.totalOrders.toLocaleString()} Mock Orders Stored
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono flex items-baseline gap-2">
                <span>${cumulativeStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-sm font-semibold text-indigo-300 font-sans">USD</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                Cumulative financial value across all <strong>{cumulativeStats.totalOrders.toLocaleString()}</strong> mock orders stored in the application, including historical monthly batches, 7-day granular logs, and active order <strong>#{currentOrder.id}</strong>.
              </p>
            </div>
          </div>

          {/* Quick Breakdown Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Total Stored Orders
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white">
                {cumulativeStats.totalOrders.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                +{cumulativeStats.growthRatePercent}% velocity
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Average Order Value
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                ${cumulativeStats.averageOrderValue.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400">
                Across all deliveries
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                7-Day Run-Rate
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                ${cumulativeStats.sevenDayRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {cumulativeStats.sevenDayOrders} orders this week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Purchase Customer Access Banner (Always available if order is paid) */}
      {currentOrder.paymentStatus === 'PAID' && (
        <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Order #{currentOrder.id} Verified &amp; Paid
                </span>
                <span className="text-xs text-indigo-300 font-mono">
                  Licensed to {currentOrder.user.name} ({currentOrder.user.email})
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Instant Access: {currentOrder.product.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Your post-payment fulfillment pipeline executed successfully. S3 temporary credentials have been generated and your personalized cryptographic forensic watermark has been embedded.
              </p>
            </div>

            {/* Actions & S3 Countdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* S3 Countdown Badge */}
              <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    S3 Link TTL
                  </div>
                  <div className="text-sm font-bold font-mono text-amber-300">
                    {remainingSeconds > 0 ? `${formatCountdown(remainingSeconds)} remaining` : 'Expired (Click to renew)'}
                  </div>
                </div>
              </div>

              {/* Download E-Book Button */}
              <button
                id="btn-store-download-ebook"
                onClick={onTriggerDownload}
                disabled={isGeneratingPdf}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Generating Watermarked PDF...' : 'Download E-Book (PDF)'}
              </button>

              {/* Download Receipt Button */}
              <button
                id="btn-store-download-receipt"
                onClick={onTriggerReceiptDownload}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-300" />
                Receipt PDF
              </button>
            </div>
          </div>

          {/* Quick fulfillment shortcuts bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Forensically Watermarked
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Resend Confirmation Sent
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab('inbox')}
                className="text-xs text-indigo-300 hover:text-white underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                View Customer Inbox Email
                <ChevronRight className="w-3 h-3" />
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onNavigateToTab('pipeline')}
                className="text-xs text-indigo-300 hover:text-white underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                Inspect Fulfillment Architecture
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Left Column: Product Information & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official 2026 Edition • By Kartikey Singh</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Cloud Native <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">
              Microservices Architecture
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            The definitive field manual for building distributed systems that survive production chaos. Master zero-trust ingress, 15-minute S3 signed URLs, idempotent webhook orchestration, and automated forensic watermarking.
          </p>

          {/* Social Proof & Rating */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-slate-900">4.9 / 5.0</span>
            <span className="text-slate-400">•</span>
            <span>Over 12,400+ Software Architects &amp; Engineers reading</span>
          </div>

          {/* Quick Specifications Pill Group */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Format</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Vectorized PDF + ePub</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Length</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">450+ Pages &amp; Blueprints</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Delivery</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Instant 15-min S3</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Author</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Kartikey Singh</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <button
              id="btn-hero-buy-now"
              onClick={() => onOpenCheckout()}
              className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Instant Access ($49.00)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-sample-chapter"
              onClick={() => setIsSampleModalOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Read Free Excerpt
            </button>
          </div>

          {/* Assurance footer */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              30-Day Money-Back Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              Official Kartikey Singh Tax Receipt Included
            </span>
          </div>

        </div>

        {/* Right Column: 3D Visual Book Mockup & Interactive Feature Highlights */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            
            {/* Ambient glow behind book */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl transform -rotate-3 scale-105 pointer-events-none"></div>

            {/* Book Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden space-y-6">
              
              {/* Top spine / header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold">
                    Technical Field Manual
                  </span>
                </div>
                <span className="text-[11px] font-mono bg-indigo-900/60 border border-indigo-700/50 px-2 py-0.5 rounded text-indigo-200">
                  Vol. 1
                </span>
              </div>

              {/* Book title and graphic inside card */}
              <div className="space-y-3 py-4">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                  Kartikey Singh Presents
                </div>
                <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                  Cloud Native Microservices Architecture
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Distributed Consensus, 15-Minute Signed URLs, Resilient Webhooks &amp; Production Hardening
                </p>
              </div>

              {/* Interactive preview diagram inside book */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-emerald-400">● LIVE FULFILLMENT MATRIX</span>
                  <span>AWS SigV4</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>1. Stripe Webhook:</span>
                    <span className="text-indigo-400 font-semibold">HMAC SHA-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. S3 Presigned URL:</span>
                    <span className="text-amber-400 font-semibold">15-min TTL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Forensic Watermark:</span>
                    <span className="text-emerald-400 font-semibold">Dynamic pdf-lib</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4. Official Receipt:</span>
                    <span className="text-blue-400 font-semibold">PDFKit Stream</span>
                  </div>
                </div>
              </div>

              {/* Author footer inside book */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                    KS
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">Kartikey Singh</div>
                    <div className="text-[10px] text-slate-400">Lead Cloud Architect</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsSampleModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  Peek Inside
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Architectural Pillars / What's Inside */}
      <section className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Battle-Tested Cloud Architecture
          </h2>
          <p className="text-sm text-slate-600">
            Real enterprise implementations you can deploy straight to production, backed by mathematical consistency models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              15-Minute S3 Signed URLs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Offload multi-megabyte digital asset delivery directly to AWS S3 / Cloud Storage edge without routing heavy payloads through compute servers. Bounded 15-minute TTL guarantees link privacy.
            </p>
            <div className="text-[11px] font-mono text-indigo-600 bg-indigo-50/50 p-2 rounded border border-indigo-100">
              AWS4-HMAC-SHA256 • Expires=900
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Dynamic Forensic Watermarking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cryptographically stamps the buyer's email, order number, and timestamp onto every single page at streaming time using pdf-lib. Protects IP without clumsy passwords or DRM friction.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50/50 p-2 rounded border border-emerald-100">
              pdf-lib • Stamped Header &amp; Seal
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Idempotent Webhook Pipelines
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Production Next.js route handling Stripe webhooks with HMAC verification, Prisma database atomic state transitions, PDFKit in-memory receipts, and Resend transactional dispatch.
            </p>
            <div className="text-[11px] font-mono text-blue-700 bg-blue-50/50 p-2 rounded border border-blue-100">
              app/api/webhooks/stripe/route.ts
            </div>
          </div>

        </div>
      </section>

      {/* 7-Day Order Volume Analytics & Total Revenue Summary Card */}
      <section className="space-y-6">
        
        {/* Total Revenue Summary Card */}
        <div 
          id="card-total-revenue-summary"
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden"
        >
          {/* Ambient accent glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Primary Revenue Display */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Total Revenue
                </span>
                <span className="text-xs text-indigo-300 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Stripe Settled • Cumulative Mock Order History
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono flex items-baseline gap-2">
                  <span>${cumulativeStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-sm font-semibold text-indigo-300 font-sans">USD</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                  Cumulative gross earnings across <strong>{cumulativeStats.totalOrders}</strong> verified digital copies delivered via S3 signed URLs, with real-time inclusion of active order <strong>#{currentOrder.id}</strong> ({currentOrder.user.name}).
                </p>
              </div>
            </div>

            {/* Quick Breakdown Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  Total Orders
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white">
                  {cumulativeStats.totalOrders}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  +{cumulativeStats.growthRatePercent}% this week
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  Average Order Value
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                  ${cumulativeStats.averageOrderValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Per digital delivery
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  Today's Run-Rate
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                  ${cumulativeStats.todayRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  {cumulativeStats.todayOrders} units processed
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Financial Perspectives Navigation & Chart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Financial Analytics &amp; Volume Metrics</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live Macro &amp; Micro Telemetry
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Correlating macro 8-month trajectory with micro 7-day fulfillment velocity.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFinancialTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                financialTab === 'both'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both Charts
            </button>
            <button
              type="button"
              onClick={() => setFinancialTab('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                financialTab === 'monthly'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Revenue
            </button>
            <button
              type="button"
              onClick={() => setFinancialTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                financialTab === 'daily'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Daily Volume
            </button>
          </div>
        </div>

        {/* Chart 1: Monthly Revenue Trends compared to 7-Day Daily Volume */}
        {(financialTab === 'both' || financialTab === 'monthly') && (
          <div id="section-monthly-revenue-chart" className="transition-all duration-300">
            <MonthlyRevenueChart currentOrder={currentOrder} />
          </div>
        )}

        {/* Chart 2: 7-Day Daily Order Volume Breakdown */}
        {(financialTab === 'both' || financialTab === 'daily') && (
          <div id="section-daily-volume-chart" className="transition-all duration-300">
            <OrderVolumeChart currentOrder={currentOrder} />
          </div>
        )}

        {/* Recent Transactions Table below the revenue charts */}
        <RecentTransactionsTable 
          currentOrder={currentOrder} 
          onNavigateToTab={onNavigateToTab} 
        />
      </section>

      {/* Detailed Chapters Breakdown */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-indigo-600 font-bold tracking-wider">
              Curriculum &amp; Blueprints
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Table of Contents
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              6 comprehensive modules covering modern high-throughput cloud infrastructure.
            </p>
          </div>

          <button
            onClick={() => setIsSampleModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Read Excerpt from Chapter 4
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 01</span>
              <span>64 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Decomposing the Monolith with Domain-Driven Design
            </h4>
            <p className="text-slate-600">
              Bounded contexts, aggregate roots, identifying microservice boundaries, anti-corruption layers, and eliminating shared database anti-patterns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 02</span>
              <span>82 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Event-Driven Sagas &amp; The Transactional Outbox Pattern
            </h4>
            <p className="text-slate-600">
              Solving distributed transactions across services without two-phase commit lock contention. Idempotent consumers and CDC with Kafka &amp; Debezium.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 03</span>
              <span>78 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Zero-Trust Security, Mutual TLS &amp; Ephemeral Credentials
            </h4>
            <p className="text-slate-600">
              SPIFFE/SPIRE workload identity, automated service mesh certificates, cryptographically verified tokens, and minimizing blast radiuses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 04</span>
              <span>72 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Secure Digital Asset Delivery: 15-Min S3 Signed URLs
            </h4>
            <p className="text-slate-600">
              AWS Signature Version 4 implementation, private asset isolation, preventing bandwidth scraping, and direct edge egress strategies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 05</span>
              <span>68 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Dynamic Stream Watermarking &amp; PDFKit Receipt Engine
            </h4>
            <p className="text-slate-600">
              In-memory PDF byte manipulation, embedding audit seals, rendering itemized tax receipts with PDFKit, and multi-channel transactional email dispatch.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-400">
              <span className="text-indigo-600 font-bold">MODULE 06</span>
              <span>90 Pages</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Production Observability, OpenTelemetry &amp; Chaos Engineering
            </h4>
            <p className="text-slate-600">
              Distributed context propagation, tail-based sampling, SLO alerting matrices, running chaos experiments, and automated circuit breaking.
            </p>
          </div>

        </div>
      </section>

      {/* Author Spotlight */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-indigo-100">
              KS
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-3">Kartikey Singh</h3>
            <p className="text-xs text-indigo-600 font-medium">Principal Cloud Architect &amp; Author</p>
            <p className="text-[11px] text-slate-400 font-mono mt-1">orders@kartikeysingh.com</p>
          </div>

          <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
            <h4 className="font-bold text-base text-slate-900">
              About the Author
            </h4>
            <p>
              Kartikey Singh has spent over a decade architecting high-scale distributed systems and cloud-native microservices processing tens of millions of daily transactions. He has led enterprise transitions from monolithic codebases to resilient event-driven topologies.
            </p>
            <p>
              His writing bridges the gap between academic theory and brutal production reality, giving engineers the exact implementation blueprints, cryptographic patterns, and fault-handling strategies required in 2026.
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-900">
              <div>
                <span className="text-indigo-600 font-bold text-base">12K+</span> Readers
              </div>
              <div>
                <span className="text-indigo-600 font-bold text-base">450+</span> Pages
              </div>
              <div>
                <span className="text-indigo-600 font-bold text-base">99.999%</span> Target SLA
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing / Product Options */}
      <section id="pricing" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase text-indigo-600 font-bold tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Access Package
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            One-time purchase with instant S3 digital delivery, personalized watermark, and official tax receipt.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tier 1: Starter */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starter</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">E-Book Edition</h3>
                <p className="text-xs text-slate-600 mt-1">For individual engineers wanting the complete reference text.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">$49</span>
                <span className="text-xs text-slate-400">USD • One-time</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Complete 450+ page PDF &amp; ePub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant 15-minute S3 signed delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personalized forensic license stamp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official PDF receipt by Kartikey Singh</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenCheckout()}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Purchase E-Book ($49)
            </button>
          </div>

          {/* Tier 2: Complete Bundle (Highlighted) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-900 text-white border-2 border-indigo-500 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Practitioner</span>
                <h3 className="text-lg font-bold text-white mt-1">Complete Architect Bundle</h3>
                <p className="text-xs text-indigo-200/80 mt-1">Includes all companion code repos, Helm charts, and diagrams.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$79</span>
                <span className="text-xs text-indigo-300">USD • One-time</span>
              </div>

              <ul className="space-y-2.5 text-xs text-indigo-100 border-t border-indigo-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Everything in E-Book Edition</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>12 Production Microservices Repositories (Go/Node)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kubernetes manifests &amp; Helm charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-resolution vector architecture diagrams</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lifetime future book updates &amp; errata</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenCheckout()}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Get Complete Bundle ($79)
            </button>
          </div>

          {/* Tier 3: Team */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Team License (10 Seats)</h3>
                <p className="text-xs text-slate-600 mt-1">For engineering organizations and architecture guilds.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">$199</span>
                <span className="text-xs text-slate-400">USD • One-time</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>10 Team Member Licenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All Companion Source Code &amp; Repos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Itemized Corporate Tax Invoice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority Architecture Q&amp;A with Kartikey Singh</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenCheckout()}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Purchase Team License ($199)
            </button>
          </div>

        </div>
      </section>

      {/* Reader Reviews & Testimonials */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-xl font-bold text-slate-900">
            Trusted by Engineering Leaders
          </h3>
          <p className="text-xs text-slate-500">
            What practitioners say after applying the patterns in production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed italic">
              "The section on 15-minute S3 signed URLs and streaming PDF watermarking alone saved us two weeks of development. Kartikey explains not just what to do, but why other approaches fail."
            </p>
            <div className="font-semibold text-slate-900 pt-1">
              David R. • Principal Cloud Architect
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed italic">
              "Finally, a guide that doesn't stop at 'use Kafka'. The outbox pattern and idempotent webhook receiver patterns are now the gold standard across our entire engineering group."
            </p>
            <div className="font-semibold text-slate-900 pt-1">
              Elena V. • VP of Engineering
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed italic">
              "The post-payment fulfillment flow diagram and source code provided the exact blueprint we needed for our digital subscription platform. A masterclass in clean architecture."
            </p>
            <div className="font-semibold text-slate-900 pt-1">
              Marcus T. • Staff Backend Engineer
            </div>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500">
            Everything you need to know about purchasing, delivery, and licensing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              How do I receive my e-book after purchasing?
            </h4>
            <p className="leading-relaxed">
              Delivery is instantaneous. As soon as Stripe verifies your payment, you receive immediate access on this screen with a 15-minute S3 signed download button, and a confirmation email is automatically sent to your inbox via Resend.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              Why does the download link expire in 15 minutes?
            </h4>
            <p className="leading-relaxed">
              We employ AWS Signature Version 4 presigned URLs with a strictly bounded 15-minute TTL to defend against unauthorized link sharing and web scraping. If your link expires, you can generate a fresh one anytime using your order ID.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              Is the e-book watermarked?
            </h4>
            <p className="leading-relaxed">
              Yes. Every copy is uniquely compiled with your name, email, and order license ID in high-resolution vector typography across the header and footer. It does not require passwords or intrusive reader software.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">
              Will I get an official tax receipt?
            </h4>
            <p className="leading-relaxed">
              Yes! An official, itemized PDF receipt by Kartikey Singh with invoice number, date, and tax calculations is attached to your confirmation email and available for instant download on the confirmation screen.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">
          Ready to Master Cloud Native Microservices?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Join 12,400+ engineers building high-throughput, fault-tolerant distributed architectures in 2026.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onOpenCheckout()}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            Get Instant Access ($49.00)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Sample Reader Excerpt Modal */}
      <SampleReaderModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        product={currentOrder.product}
        onBuyNow={() => onOpenCheckout()}
      />

    </div>
  );
};
