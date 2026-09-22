import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Clock, 
  FileCheck, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Eye, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Order, SignedUrlConfig, WatermarkConfig } from '../types';
import { formatTimeRemaining } from '../services/signedUrl';
import { createDigitalProductPdf, triggerFileDownload, createPdfBlobUrl } from '../services/pdfEngine';

interface SecureDeliveryPanelProps {
  order: Order;
  signedUrlConfig: SignedUrlConfig;
  watermarkConfig: WatermarkConfig;
  onUpdateWatermarkConfig: (cfg: Partial<WatermarkConfig>) => void;
  onRegenerateSignedUrl: () => void;
  onAddLog: (level: 'info' | 'success' | 'warn' | 'error', tag: any, message: string) => void;
}

export const SecureDeliveryPanel: React.FC<SecureDeliveryPanelProps> = ({
  order,
  signedUrlConfig,
  watermarkConfig,
  onUpdateWatermarkConfig,
  onRegenerateSignedUrl,
  onAddLog,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(signedUrlConfig.expiresInSeconds * 1000);
  const [isSimulatedExpired, setIsSimulatedExpired] = useState(false);
  const [isSimulatedTampered, setIsSimulatedTampered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [activePreviewMode, setActivePreviewMode] = useState<'watermarked' | 'original'>('watermarked');

  // Real-time countdown timer
  useEffect(() => {
    if (isSimulatedExpired) {
      setTimeRemainingMs(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = signedUrlConfig.expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeRemainingMs(0);
        setIsSimulatedExpired(true);
      } else {
        setTimeRemainingMs(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [signedUrlConfig.expiresAt, isSimulatedExpired]);

  // Handle URL copy
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(signedUrlConfig.signedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    onAddLog('info', 'S3_PRESIGN', 'Presigned URL copied to clipboard.');
  };

  // Fast forward simulation to expired
  const handleFastForwardExpiry = () => {
    setIsSimulatedExpired(true);
    setTimeRemainingMs(0);
    onAddLog('warn', 'S3_PRESIGN', 'Simulated 15-minute expiration window elapsed. Future download requests will return HTTP 403 / 410.');
  };

  // Tamper with signature
  const handleTamperSignature = () => {
    setIsSimulatedTampered(!isSimulatedTampered);
    onAddLog('warn', 'S3_PRESIGN', 'Simulated signature tampering: client altered query parameters without matching AWS HMAC secret.');
  };

  // Reset to fresh valid URL
  const handleResetToFresh = () => {
    setIsSimulatedExpired(false);
    setIsSimulatedTampered(false);
    onRegenerateSignedUrl();
    onAddLog('success', 'S3_PRESIGN', 'Generated fresh 15-minute presigned URL.');
  };

  // Real PDF Generation & Download
  const handleDownloadPdf = async (mode: 'watermarked' | 'original' = 'watermarked') => {
    if (isSimulatedExpired) {
      alert('HTTP 403 Forbidden / 410 Gone: The 15-minute presigned link has expired. Click "Regenerate Fresh 15-min Link" to proceed.');
      return;
    }
    if (isSimulatedTampered) {
      alert('HTTP 401 Unauthorized: AWS Signature Mismatch. The presigned URL signature does not match the computed HMAC.');
      return;
    }

    try {
      setIsGenerating(true);
      onAddLog('info', 'PDF_WATERMARK', `Compiling ${mode} PDF with pdf-lib for order #${order.id}...`);

      const bytes = await createDigitalProductPdf(order.product, {
        watermark: mode === 'watermarked',
        order,
        config: watermarkConfig,
      });

      const filename = mode === 'watermarked' 
        ? `${order.product.title.replace(/[^a-zA-Z0-9]/g, '_')}_Licensed_${order.id}.pdf`
        : `${order.product.title.replace(/[^a-zA-Z0-9]/g, '_')}_Original.pdf`;

      triggerFileDownload(bytes, filename);
      onAddLog('success', 'PDF_WATERMARK', `Successfully streamed and downloaded ${filename} (${bytes.length} bytes)`);

      // Update preview blob
      const blobUrl = createPdfBlobUrl(bytes);
      setPdfPreviewUrl(blobUrl);
    } catch (err: any) {
      onAddLog('error', 'PDF_WATERMARK', `Failed to generate PDF: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate preview in memory without downloading
  const handlePreviewPdf = async (mode: 'watermarked' | 'original') => {
    try {
      setIsGenerating(true);
      setActivePreviewMode(mode);
      const bytes = await createDigitalProductPdf(order.product, {
        watermark: mode === 'watermarked',
        order,
        config: watermarkConfig,
      });
      const blobUrl = createPdfBlobUrl(bytes);
      setPdfPreviewUrl(blobUrl);
      onAddLog('info', 'PDF_WATERMARK', `Generated in-memory preview for ${mode} PDF.`);
    } catch (err: any) {
      onAddLog('error', 'PDF_WATERMARK', `Preview error: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Branch 1: Secure Delivery &amp; Dynamic Watermarking
              </h2>
              <p className="text-xs text-slate-500">
                15-minute temporary presigned URL + just-in-time forensic watermark stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-fresh-url"
              onClick={handleResetToFresh}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Fresh 15-min Link
            </button>
            <button
              id="btn-stream-watermark-pdf"
              onClick={() => handleDownloadPdf('watermarked')}
              disabled={isGenerating}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isGenerating ? 'Compiling PDF...' : 'Download Watermarked PDF'}
            </button>
          </div>
        </div>

        {/* 15-Minute Signed URL Section */}
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              15-Minute Presigned S3 Access Control
            </h3>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Link TTL Remaining:</span>
              <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold flex items-center gap-1.5 ${
                isSimulatedExpired 
                  ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                  : 'bg-amber-50 text-amber-900 border border-amber-300'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isSimulatedExpired ? 'text-rose-600' : 'text-amber-600 animate-spin'}`} />
                {isSimulatedExpired ? '00:00 (EXPIRED)' : formatTimeRemaining(timeRemainingMs)}
              </span>
            </div>
          </div>

          {/* Signed URL Preview Box */}
          <div className="bg-slate-900 rounded-xl p-3.5 text-slate-200 font-mono text-xs overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-slate-400 text-[11px]">
              <span>GET {signedUrlConfig.bucket}/{signedUrlConfig.key}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? 'Copied' : 'Copy Presigned URL'}
                </button>
              </div>
            </div>

            <p className="break-all text-[11px] text-indigo-300 leading-relaxed select-all">
              {isSimulatedTampered 
                ? signedUrlConfig.signedUrl.replace('X-Amz-Signature=', 'X-Amz-Signature=TAMPERED_INVALID_SIG_') 
                : signedUrlConfig.signedUrl}
            </p>
          </div>

          {/* Expiration & Tamper Sandbox Controls */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Simulate real edge cases to test security handling:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-simulate-expire"
                onClick={handleFastForwardExpiry}
                disabled={isSimulatedExpired}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Fast-Forward 15 Mins (Expire)
              </button>

              <button
                id="btn-tamper-sig"
                onClick={handleTamperSignature}
                className={`px-2.5 py-1 rounded border font-medium transition-colors flex items-center gap-1 ${
                  isSimulatedTampered
                    ? 'bg-rose-100 border-rose-300 text-rose-800'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                {isSimulatedTampered ? 'Signature Tampered (Active)' : 'Tamper With Token'}
              </button>
            </div>
          </div>

          {/* Conditional Error Notice if Expired or Tampered */}
          {isSimulatedExpired && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950">HTTP 410 Gone / 403 Forbidden: Presigned Link Expired</h4>
                <p className="mt-1 text-rose-800 leading-relaxed">
                  The 15-minute expiration timestamp has elapsed. S3 and the API route reject direct downloads to prevent unauthorized hotlink sharing. The customer can request a renewed link from their account portal or email.
                </p>
                <button
                  onClick={handleResetToFresh}
                  className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs transition-colors"
                >
                  Issue Fresh 15-Minute Link
                </button>
              </div>
            </div>
          )}

          {isSimulatedTampered && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950">HTTP 401 Unauthorized: AWS Signature Mismatch</h4>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  The query parameters or signature have been modified. AWS S3 Signature Version 4 validates the canonical request hash and returns <code className="font-mono text-amber-950">SignatureDoesNotMatch</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Watermarking Engine Controls & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Forensic Watermark Customizer
            </h3>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              pdf-lib runtime
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Configure metadata injected dynamically into every page of the streamed PDF via <code className="text-indigo-600 font-mono text-[11px]">app/api/download/[orderId]/route.ts</code>.
          </p>

          {/* Watermark Pattern Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Footer Watermark Pattern (Page {order.product.pages})
            </span>
            <div className="p-2.5 bg-white border border-slate-300 rounded font-mono text-[11px] text-slate-800 break-all">
              Licensed to <span className="font-bold text-indigo-700">{order.user.email}</span> | Order #{order.id}
              {watermarkConfig.includeTimestamp && <span className="text-slate-500"> | 2026-09-21 UTC</span>}
              {watermarkConfig.includeIp && <span className="text-slate-500"> | IP: {order.user.ipAddress}</span>}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Customer Email Stamp</span>
              <input
                type="checkbox"
                checked={watermarkConfig.includeEmail}
                onChange={(e) => onUpdateWatermarkConfig({ includeEmail: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Unique Order ID (#ord_...)</span>
              <input
                type="checkbox"
                checked={watermarkConfig.includeOrderId}
                onChange={(e) => onUpdateWatermarkConfig({ includeOrderId: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Timestamp &amp; UTC Timezone</span>
              <input
                type="checkbox"
                checked={watermarkConfig.includeTimestamp}
                onChange={(e) => onUpdateWatermarkConfig({ includeTimestamp: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Buyer IP Address Tracking</span>
              <input
                type="checkbox"
                checked={watermarkConfig.includeIp}
                onChange={(e) => onUpdateWatermarkConfig({ includeIp: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Diagonal Center DRM Watermark (35°)</span>
              <input
                type="checkbox"
                checked={watermarkConfig.includeDiagonalWatermark}
                onChange={(e) => onUpdateWatermarkConfig({ includeDiagonalWatermark: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
            </label>
          </div>

          {/* Sliders */}
          <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Font Size</span>
                <span className="font-mono font-bold text-slate-800">{watermarkConfig.fontSize}pt</span>
              </div>
              <input
                type="range"
                min="7"
                max="14"
                step="1"
                value={watermarkConfig.fontSize}
                onChange={(e) => onUpdateWatermarkConfig({ fontSize: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Footer Position Y</span>
                <span className="font-mono font-bold text-slate-800">{watermarkConfig.positionY}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="2"
                value={watermarkConfig.positionY}
                onChange={(e) => onUpdateWatermarkConfig({ positionY: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handlePreviewPdf('watermarked')}
              disabled={isGenerating}
              className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Update In-App Preview
            </button>
            <button
              onClick={() => handleDownloadPdf('watermarked')}
              disabled={isGenerating}
              className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download .PDF
            </button>
          </div>
        </div>

        {/* PDF Visualizer / Comparison Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live Stream Visualizer
                </h3>
                <span className="text-[11px] text-slate-500">
                  A4 Output Preview ({order.product.pages} pages, embedded Helvetica)
                </span>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => handlePreviewPdf('watermarked')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePreviewMode === 'watermarked'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Watermarked (Stream)
                </button>
                <button
                  onClick={() => handlePreviewPdf('original')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activePreviewMode === 'original'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Original S3 Asset (Unmarked)
                </button>
              </div>
            </div>

            {/* Simulated Document Preview Page */}
            <div className="relative bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-center min-h-[360px]">
              <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-slate-300 p-6 flex flex-col justify-between relative overflow-hidden text-slate-800">
                
                {/* Diagonal watermark overlay in simulated card */}
                {activePreviewMode === 'watermarked' && watermarkConfig.includeDiagonalWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                    <span className="transform -rotate-30 text-slate-300/40 font-bold text-lg tracking-wider text-center uppercase border-2 border-dashed border-slate-300/40 p-4 rounded-xl">
                      LICENSED TO {order.user.email}
                      <br />
                      CONFIDENTIAL
                    </span>
                  </div>
                )}

                {/* Mock Page Content */}
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-blue-700 font-bold">
                      CONFIDENTIAL LICENSED EDITION
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {order.product.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.product.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800 text-[11px]">
                      1. Executive Overview &amp; Threat Model
                    </p>
                    <p className="text-[11px]">
                      This engineering playbook establishes standard operating procedures for zero-trust post-payment content distribution. Master assets are kept strictly isolated in private cloud storage.
                    </p>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] font-mono text-slate-700">
                      // lib/storage.ts<br />
                      const url = await getSignedUrl(s3, command, &#123; expiresIn: 900 &#125;);
                    </div>
                  </div>
                </div>

                {/* Simulated Footer Watermark */}
                <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  {activePreviewMode === 'watermarked' ? (
                    <div className="text-slate-500 font-medium">
                      Licensed to <span className="text-indigo-600 font-bold">{order.user.email}</span> | Order #{order.id}
                      {watermarkConfig.includeTimestamp && <span> | 2026-09-21 UTC</span>}
                      {watermarkConfig.includeIp && <span> | IP: {order.user.ipAddress}</span>}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No purchaser watermark applied (Private asset)</span>
                  )}
                  <span>Page 1 of {order.product.pages}</span>
                </div>

              </div>
            </div>
          </div>

          {/* Quick PDF Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">
              Ready to verify on your local machine:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadPdf('original')}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Download Original Asset
              </button>
              <button
                onClick={() => handleDownloadPdf('watermarked')}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Watermarked PDF
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
