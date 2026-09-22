import React, { useState } from 'react';
import { 
  Inbox, 
  Mail, 
  Download, 
  Clock, 
  CheckCircle2, 
  Paperclip, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Order, EmailDispatch, SignedUrlConfig, WatermarkConfig } from '../types';
import { formatTimeRemaining } from '../services/signedUrl';
import { createDigitalProductPdf, createReceiptPdf, triggerFileDownload } from '../services/pdfEngine';

interface CustomerInboxProps {
  order: Order;
  emails: EmailDispatch[];
  signedUrlConfig: SignedUrlConfig;
  watermarkConfig: WatermarkConfig;
  onMarkRead: (emailId: string) => void;
  onAddLog: (level: 'info' | 'success' | 'warn' | 'error', tag: any, message: string) => void;
}

export const CustomerInbox: React.FC<CustomerInboxProps> = ({
  order,
  emails,
  signedUrlConfig,
  watermarkConfig,
  onMarkRead,
  onAddLog,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const handleSelectEmail = (email: EmailDispatch) => {
    setSelectedEmailId(email.id);
    if (!email.read) {
      onMarkRead(email.id);
    }
  };

  const handleDownloadProduct = async () => {
    try {
      setIsDownloading(true);
      onAddLog('info', 'PDF_WATERMARK', `Customer triggered watermarked download from email link...`);
      const bytes = await createDigitalProductPdf(order.product, {
        watermark: true,
        order,
        config: watermarkConfig,
      });
      const filename = `${order.product.title.replace(/[^a-zA-Z0-9]/g, '_')}_Licensed_${order.id}.pdf`;
      triggerFileDownload(bytes, filename);
      onAddLog('success', 'PDF_WATERMARK', `Downloaded ${filename}`);
    } catch (err: any) {
      onAddLog('error', 'PDF_WATERMARK', `Download error: ${err?.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      const filename = `Receipt-${order.id}.pdf`;
      onAddLog('info', 'RECEIPT_PDF', `Customer downloaded receipt PDF attachment (${filename}) from email...`);
      const bytes = await createReceiptPdf(order, 'kartikey');
      triggerFileDownload(bytes, filename);
      onAddLog('success', 'RECEIPT_PDF', `Downloaded receipt attachment ${filename} (${bytes.length} bytes)`);
    } catch (err: any) {
      onAddLog('error', 'RECEIPT_PDF', `Download error: ${err?.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const remainingMs = Math.max(0, signedUrlConfig.expiresAt - Date.now());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Inbox Simulation
            </h2>
            <p className="text-xs text-slate-500">
              Simulated recipient: <span className="font-semibold text-slate-800">{order.user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {emails.length} Transactional Messages Received
          </span>
        </div>
      </div>

      {/* Split Inbox View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs min-h-[460px]">
        
        {/* Email List Sidebar */}
        <div className="md:col-span-4 border-r border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
          <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>INBOX</span>
            <span className="text-[11px] text-slate-400 font-normal">Dual Pipeline Dispatch</span>
          </div>

          {emails.map((email) => {
            const isSelected = email.id === selectedEmail?.id;
            return (
              <button
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`w-full text-left p-4 transition-colors relative flex flex-col gap-1 cursor-pointer ${
                  isSelected ? 'bg-white shadow-xs' : 'hover:bg-slate-100/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate">
                    {email.from 
                      ? email.from.split('<')[0].trim() 
                      : (email.type === 'combined' 
                          ? 'Kartikey Singh' 
                          : (email.type === 'delivery' ? 'CloudDeliver Fulfillment' : 'Kartikey Singh'))}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Just now
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 truncate">
                  {email.subject}
                </div>

                <div className="text-[11px] text-slate-500 line-clamp-1">
                  {email.previewText}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {email.type === 'combined' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      <Clock className="w-3 h-3" />
                      E-Book Link + Receipt PDF
                    </span>
                  ) : email.type === 'delivery' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      <Clock className="w-3 h-3" />
                      15-min Expiring Link
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <Paperclip className="w-3 h-3" />
                      PDF Receipt Attached
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Email Reading Pane */}
        <div className="md:col-span-8 p-6 flex flex-col justify-between">
          {selectedEmail ? (
            <div className="space-y-6">
              {/* Email Headers */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedEmail.subject}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    {selectedEmail.type === 'combined' ? 'RESEND • STRIPE WEBHOOK' : selectedEmail.type.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>From: <span className="text-slate-800 font-medium">
                    {selectedEmail.from || (selectedEmail.type === 'combined' ? 'Kartikey Singh <orders@kartikeysingh.com>' : selectedEmail.type === 'delivery' ? 'Kartikey Singh <orders@kartikeysingh.com>' : 'Kartikey Singh <orders@kartikeysingh.com>')}
                  </span></div>
                  <div>To: <span className="text-slate-800 font-medium">{selectedEmail.to}</span></div>
                  <div>Date: <span className="text-slate-700">{new Date(selectedEmail.sentAt).toLocaleString()}</span></div>
                </div>
              </div>

              {/* Email Body: Combined Webhook Delivery (app/api/webhooks/stripe/route.ts) */}
              {selectedEmail.type === 'combined' && (
                <div className="space-y-5 text-xs text-slate-700 leading-relaxed max-w-xl">
                  {/* Webhook-generated HTML header */}
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Thank you for your purchase!
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Hi <span className="font-semibold text-slate-900">{order.user.name}</span>, your payment was successful.
                    </p>
                  </div>

                  {/* E-book download section */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>E-Book Digital Access</span>
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
                          EBOOK
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {remainingMs > 0 ? `Valid ${formatTimeRemaining(remainingMs)}` : 'Expired'}
                      </span>
                    </div>

                    <p className="text-slate-600">
                      Click below to download your e-book (Link valid for 15 minutes).
                    </p>

                    <button
                      onClick={handleDownloadProduct}
                      disabled={isDownloading}
                      className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? 'Streaming Watermarked PDF...' : `Download ${order.product.title} (PDF)`}
                    </button>
                  </div>

                  {/* Official tax receipt section */}
                  <div className="space-y-2">
                    <p className="text-slate-600">
                      Your official tax receipt is attached to this email.
                    </p>

                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">
                            Receipt-{order.id}.pdf
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Kartikey Singh • Official Purchase Receipt
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadReceipt}
                        disabled={isDownloading}
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Receipt
                      </button>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Order #{order.id} • Total: ${order.amount.toFixed(2)} USD</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">PAID</span>
                  </div>
                </div>
              )}

              {/* Email Body: Branch 1 Delivery */}
              {selectedEmail.type === 'delivery' && (
                <div className="space-y-5 text-xs text-slate-700 leading-relaxed max-w-xl">
                  <p>
                    Hi {order.user.name},
                  </p>
                  <p>
                    Thank you for your purchase! Your digital copy of <strong className="text-slate-900">{order.product.title}</strong> is now compiled and ready for download.
                  </p>

                  {/* Call to action card */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{order.product.title}</div>
                        <div className="text-slate-500 text-[11px]">{order.product.pages} Pages • Digital PDF Edition</div>
                      </div>
                      <span className="px-2 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {remainingMs > 0 ? `Link valid: ${formatTimeRemaining(remainingMs)}` : 'Expired'}
                      </span>
                    </div>

                    <button
                      onClick={handleDownloadProduct}
                      disabled={isDownloading}
                      className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? 'Streaming Watermarked PDF...' : 'Download Your Licensed PDF (15-min link)'}
                    </button>

                    <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded border border-slate-200">
                      <strong className="text-slate-700">Digital Rights &amp; Watermarking:</strong> This document is strictly licensed to <span className="text-indigo-600 font-semibold">{order.user.email}</span> under Order #{order.id}. Each page contains an immutable purchaser watermark.
                    </div>
                  </div>

                  <p className="text-slate-500 text-[11px]">
                    Need a new download link after 15 minutes? You can request a fresh access link at any time by signing in to your purchase portal.
                  </p>
                </div>
              )}

              {/* Email Body: Branch 2 Receipt */}
              {selectedEmail.type === 'receipt' && (
                <div className="space-y-5 text-xs text-slate-700 leading-relaxed max-w-xl">
                  <p>
                    Hi {order.user.name},
                  </p>
                  <p>
                    Here is your official receipt for order <strong className="text-slate-900">#{order.id}</strong>. A PDF copy has been attached to this email for your accounting records.
                  </p>

                  {/* Invoice Summary Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center text-slate-800">
                      <span className="font-semibold">{order.product.title}</span>
                      <span className="font-mono">${order.product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Sales Tax (8.25%)</span>
                      <span className="font-mono">${(order.product.price * 0.0825).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm text-slate-900">
                      <span>Total Paid (Stripe)</span>
                      <span className="text-emerald-700 font-mono">${(order.product.price * 1.0825).toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Attached PDF Box */}
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          REC-{order.id.replace('ord_', '')}.pdf
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Kartikey Singh • Official Purchase Receipt
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadReceipt}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Attachment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <Mail className="w-8 h-8 mb-2" />
              <span>Select an email on the left to read its contents.</span>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dispatched via transactional webhook pipeline</span>
            <span>SPF / DKIM / DMARC Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
};
