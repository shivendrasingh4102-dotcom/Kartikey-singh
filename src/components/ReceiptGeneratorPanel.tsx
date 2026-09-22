import React, { useState } from 'react';
import { 
  Receipt, 
  FileText, 
  Download, 
  Mail, 
  CheckCircle2, 
  Printer, 
  Code, 
  Eye, 
  CreditCard,
  Building,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Order } from '../types';
import { createReceiptPdf, triggerFileDownload, createPdfBlobUrl } from '../services/pdfEngine';

interface ReceiptGeneratorPanelProps {
  order: Order;
  onNavigateToInbox: () => void;
  onAddLog: (level: 'info' | 'success' | 'warn' | 'error', tag: any, message: string) => void;
}

export const ReceiptGeneratorPanel: React.FC<ReceiptGeneratorPanelProps> = ({
  order,
  onNavigateToInbox,
  onAddLog,
}) => {
  const [activeView, setActiveView] = useState<'html' | 'pdf' | 'api'>('html');
  const [receiptTemplate, setReceiptTemplate] = useState<'kartikey' | 'detailed'>('kartikey');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const subtotal = order.product.price;
  const taxRate = 0.0825;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  const invoiceNumber = order.id.replace('ord_', 'INV-2026-');
  const kartikeyReceiptNo = `REC-${order.id.replace('ord_', '')}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Handle PDF Receipt Download
  const handleDownloadReceiptPdf = async () => {
    try {
      setIsGenerating(true);
      const filename = receiptTemplate === 'kartikey'
        ? `Receipt-${order.id}.pdf`
        : `Receipt_${invoiceNumber}.pdf`;

      onAddLog('info', 'RECEIPT_PDF', `Rendering ${receiptTemplate === 'kartikey' ? 'Kartikey Singh (PDFKit)' : 'detailed A4'} receipt for ${filename}...`);

      const bytes = await createReceiptPdf(order, receiptTemplate);
      triggerFileDownload(bytes, filename);

      onAddLog('success', 'RECEIPT_PDF', `Downloaded official receipt ${filename} (${bytes.length} bytes)`);
    } catch (err: any) {
      onAddLog('error', 'RECEIPT_PDF', `Failed to generate receipt PDF: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-dispatch transactional email via Resend/SendGrid simulator
  const handleDispatchEmail = () => {
    setEmailSentNotice(true);
    const attachmentFile = receiptTemplate === 'kartikey' ? `${kartikeyReceiptNo}.pdf` : `Receipt_${invoiceNumber}.pdf`;
    onAddLog('success', 'EMAIL_SERVICE', `Dispatched receipt with attached ${attachmentFile} to ${order.user.email} via Resend API (HTTP 200 OK)`);
    setTimeout(() => setEmailSentNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Branch 2: Automated Receipt Generation &amp; Dispatch
              </h2>
              <p className="text-xs text-slate-500">
                PDFKit receipt generator (lib/receipt.ts) • Itemized line items • Resend transactional dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Selector */}
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setReceiptTemplate('kartikey')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  receiptTemplate === 'kartikey'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kartikey Singh (PDFKit)
              </button>
              <button
                onClick={() => setReceiptTemplate('detailed')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  receiptTemplate === 'detailed'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed Tax Invoice
              </button>
            </div>

            <button
              onClick={handleDispatchEmail}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Re-send Email
            </button>
            <button
              onClick={handleDownloadReceiptPdf}
              disabled={isGenerating}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isGenerating ? 'Compiling PDF...' : `Download ${receiptTemplate === 'kartikey' ? 'Kartikey Receipt' : 'Invoice'} PDF`}
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveView('html')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'html'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              1. HTML Receipt Template
            </button>

            <button
              onClick={() => setActiveView('pdf')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'pdf'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              2. Vectorized PDF Document
            </button>

            <button
              onClick={() => setActiveView('api')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'api'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              3. Resend / SendGrid Payload
            </button>
          </div>

          <button
            onClick={onNavigateToInbox}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            View in Customer Inbox &rarr;
          </button>
        </div>

        {emailSentNotice && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Transactional email dispatched with attached <code className="font-mono">invoice-{invoiceNumber}.pdf</code> to {order.user.email}. Check the Customer Inbox tab!</span>
          </div>
        )}
      </div>

      {/* Main Display based on Active View */}
      {activeView === 'html' && (
        <>
          {receiptTemplate === 'kartikey' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs max-w-2xl mx-auto">
              {/* Brand Header */}
              <div className="pb-4">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kartikey Singh</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Official Purchase Receipt</p>
              </div>

              {/* Order Metadata */}
              <div className="space-y-1 text-xs text-slate-700 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Receipt No:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{kartikeyReceiptNo}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Date:</span> {formattedDate}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Customer:</span> {order.user.name} ({order.user.email})
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 font-mono text-slate-400 select-none text-xs tracking-wider">
                --------------------------------------------------
              </div>

              {/* Line Items */}
              <div className="space-y-2 py-1 text-xs">
                <div className="flex justify-between items-center text-slate-900">
                  <span className="font-medium">{order.product.title}</span>
                  <span className="font-mono font-semibold">${order.product.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 font-mono text-slate-400 select-none text-xs tracking-wider">
                --------------------------------------------------
              </div>

              {/* Total Paid */}
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1">
                <span>Total Paid:</span>
                <span className="text-emerald-700 font-mono text-base">${order.amount.toFixed(2)}</span>
              </div>

              {/* Footer specs note */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct output matching <code className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded">generateReceiptBuffer()</code></span>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">margin: 50pt</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-3xl mx-auto">
              {/* HTML Receipt Document */}
              <div className="space-y-6 text-slate-800">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-widest font-bold text-slate-500">TAX INVOICE</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        PAID
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      #{invoiceNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Issued on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">CloudDeliver Inc.</div>
                    <div className="text-xs text-slate-500 leading-tight">
                      100 Montgomery St, Suite 2400<br />
                      San Francisco, CA 94104<br />
                      VAT: US-849201948
                    </div>
                  </div>
                </div>

                {/* Billed To / From */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                      Billed To
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-1">{order.user.name}</p>
                    <p className="text-slate-600">{order.user.email}</p>
                    <p className="text-slate-500 text-[11px] mt-1 font-mono">
                      IP at Checkout: {order.user.ipAddress}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span className="font-semibold text-slate-900">{order.paymentMethod} ending in {order.cardLast4}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 font-mono">
                      Gateway Ref: {order.sessionId.substring(0, 20)}...
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4 rounded-l-lg">Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.product.title}</div>
                          <div className="text-[11px] text-slate-500">Electronic PDF delivery with customer-specific forensic watermark</div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">1</td>
                        <td className="py-3 px-3 text-right text-slate-700 font-mono">${order.product.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">${order.product.price.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Tax (8.25%):</span>
                      <span className="font-mono">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                      <span>Total Paid:</span>
                      <span className="text-emerald-700 font-mono">${totalAmount.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span>This receipt was generated automatically upon payment completion.</span>
                  <span className="font-mono text-[10px]">Audit Hash: {order.id.replace('ord_', '')}-SHA256</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'pdf' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {receiptTemplate === 'kartikey'
                  ? 'PDFKit Architecture Specification (lib/receipt.ts)'
                  : 'Vectorized A4 Tax Specification (Puppeteer/PDFKit)'}
              </h3>
              <p className="text-xs text-slate-500">
                {receiptTemplate === 'kartikey'
                  ? 'Fast server-side streaming via PDFKit Buffer chunking'
                  : 'Multi-column corporate tax invoice with audit trail'}
              </p>
            </div>
            <button
              onClick={handleDownloadReceiptPdf}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download {receiptTemplate === 'kartikey' ? 'Kartikey Receipt' : 'Invoice'} (.PDF)
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">PDF Engine</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {receiptTemplate === 'kartikey' ? 'PDFKit (import PDFDocument)' : 'pdf-lib / Puppeteer'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Document Margins</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {receiptTemplate === 'kartikey' ? 'margin: 50pt' : 'Top/Bottom: 48pt'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Header Brand</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {receiptTemplate === 'kartikey' ? 'Kartikey Singh (20pt)' : 'CloudDeliver Inc.'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Receipt Reference</span>
                <p className="font-semibold text-emerald-700 mt-0.5">
                  {receiptTemplate === 'kartikey' ? kartikeyReceiptNo : invoiceNumber}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
              {receiptTemplate === 'kartikey'
                ? 'Compiled dynamically into an in-memory Node.js Buffer using doc.on("data", buffers.push) and doc.on("end", Buffer.concat). Perfect for zero-disk-write serverless lambdas.'
                : 'The PDF compilation engine embeds both merchant legal registration and customer metadata, ensuring the resulting document passes standard corporate audit and European VAT rules.'}
            </p>
          </div>
        </div>
      )}

      {activeView === 'api' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Transactional Dispatch Payload (Resend / SendGrid)
              </h3>
              <p className="text-xs text-slate-500">
                POST https://api.resend.com/emails with base64 PDF attachment
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              HTTP 200 OK
            </span>
          </div>

          <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800">
            <pre className="text-emerald-400 text-[11px] leading-relaxed">
{`// Dispatched via Resend / SendGrid API
POST https://api.resend.com/emails
Authorization: Bearer re_live_9a87d...
Content-Type: application/json

{
  "from": "Kartikey Singh <receipts@kartikey.io>",
  "to": ["${order.user.email}"],
  "subject": "Receipt for your purchase - Order #${order.id}",
  "html": "<p>Hi ${order.user.name}, your receipt ${kartikeyReceiptNo} is attached.</p>",
  "attachments": [
    {
      "filename": "${receiptTemplate === 'kartikey' ? `${kartikeyReceiptNo}.pdf` : `Receipt_${invoiceNumber}.pdf`}",
      "content": "JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvUGFnZXMK... [Base64 PDF Buffer]",
      "contentType": "application/pdf"
    }
  ],
  "tags": [
    { "name": "order_id", "value": "${order.id}" },
    { "name": "receipt_no", "value": "${kartikeyReceiptNo}" }
  ]
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
