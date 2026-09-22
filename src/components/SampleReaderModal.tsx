import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, CheckCircle2, Lock, Shield, Download } from 'lucide-react';
import { Product } from '../types';

interface SampleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onBuyNow: () => void;
}

export const SampleReaderModal: React.FC<SampleReaderModalProps> = ({
  isOpen,
  onClose,
  product,
  onBuyNow,
}) => {
  const [activeChapter, setActiveChapter] = useState<'intro' | 'ch4' | 'ch5'>('ch4');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                  Free Reader Excerpt
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded">
                  By Kartikey Singh
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100">{product.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-2 text-xs gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveChapter('ch4')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeChapter === 'ch4'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chapter 4: S3 Signed URLs &amp; Edge Ingress
          </button>
          <button
            onClick={() => setActiveChapter('ch5')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeChapter === 'ch5'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chapter 5: Dynamic PDF Watermarking &amp; DRM
          </button>
          <button
            onClick={() => setActiveChapter('intro')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeChapter === 'intro'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Author Foreword
          </button>
        </div>

        {/* Reader Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed space-y-5 font-serif">
          {activeChapter === 'ch4' && (
            <div className="space-y-4 font-sans">
              <div className="border-b border-slate-200 pb-3 font-serif">
                <span className="text-xs font-mono text-indigo-600 uppercase font-semibold">
                  Section 4.3 • Distributed Asset Protection
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">
                  AWS S3 Presigned URLs: The Zero-Trust Ephemeral Strategy
                </h4>
                <p className="text-xs text-slate-500 italic mt-0.5">By Kartikey Singh • 12 min read</p>
              </div>

              <p className="text-slate-700">
                In modern multi-tenant architectures, static asset protection cannot rely on long-lived public access or web application firewalls alone. When a customer purchases proprietary material—such as an e-book, an encrypted binary, or architectural blueprints—the asset storage bucket must remain completely isolated from public internet ingress.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 border border-slate-800">
                <div className="text-emerald-400 font-bold">// Canonical AWS Signature Version 4 Pattern</div>
                <div>X-Amz-Algorithm=AWS4-HMAC-SHA256</div>
                <div>X-Amz-Credential=AKIAIOSFODNN7EXAMPLE/20260921/us-east-1/s3/aws4_request</div>
                <div>X-Amz-Expires=900 <span className="text-slate-400">// Strictly bounded 15-minute TTL</span></div>
                <div>X-Amz-SignedHeaders=host</div>
                <div>X-Amz-Signature=8d9f4e...9b1a03</div>
              </div>

              <h5 className="font-bold text-base text-slate-900 pt-2 font-serif">
                Why 15 Minutes (900 Seconds) is the Golden Standard
              </h5>
              <p className="text-slate-700">
                A 15-minute window grants legitimate buyers ample bandwidth to initiate and stream their multi-megabyte payload, while completely neutralizing the threat of link sharing, social media redistribution, or automated scraper indexing. If a link is leaked in a forum, it expires before any significant unauthorized egress can occur.
              </p>

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Architectural Rule:</strong> Never route multi-megabyte media files through your serverless API routes or application compute containers. Always issue presigned S3/GCS URLs and let the cloud storage provider's global edge network handle the multi-gigabit transport directly.
                </div>
              </div>
            </div>
          )}

          {activeChapter === 'ch5' && (
            <div className="space-y-4 font-sans">
              <div className="border-b border-slate-200 pb-3 font-serif">
                <span className="text-xs font-mono text-indigo-600 uppercase font-semibold">
                  Section 5.1 • DRM Without User Friction
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">
                  Dynamic Forensic PDF Watermarking at Stream Time
                </h4>
                <p className="text-xs text-slate-500 italic mt-0.5">By Kartikey Singh • 10 min read</p>
              </div>

              <p className="text-slate-700">
                Traditional DRM solutions that require proprietary reader software or password keys frustrate paying customers. Forensic watermarking takes the opposite approach: preserve the open, accessible PDF format, while embedding cryptographic ownership tokens (buyer email, order ID, and transaction timestamp) onto every single page.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside">
                <li><strong>Page Header/Footer:</strong> Unobtrusive micro-typography displaying <code>Licensed exclusively to buyer@example.com</code>.</li>
                <li><strong>Diagonal Translucent Stamp:</strong> 5% opacity diagonal watermark across key architectural diagrams.</li>
                <li><strong>Audit Metadata:</strong> SHA-256 hash sealed in the PDF document catalog dictionary.</li>
              </ul>
            </div>
          )}

          {activeChapter === 'intro' && (
            <div className="space-y-4 font-sans">
              <div className="border-b border-slate-200 pb-3 font-serif">
                <span className="text-xs font-mono text-indigo-600 uppercase font-semibold">
                  Author Foreword
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">
                  Building Systems That Endure
                </h4>
                <p className="text-xs text-slate-500 italic mt-0.5">Kartikey Singh • Senior Distributed Systems Architect</p>
              </div>

              <p className="text-slate-700">
                Over the past decade designing and operating cloud-native systems for millions of concurrent users, one truth consistently surfaces: reliability is not an accident of good hardware, but a consequence of disciplined patterns.
              </p>
              <p className="text-slate-700">
                This field manual was written to serve as the reference desk companion you reach for when planning distributed state machines, implementing resilient payment pipelines, or defending digital IP without sacrificing customer joy.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with CTA */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Enjoying the excerpt?</span> Unlock the full 450+ page manual + code.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Continue Reading Store
            </button>
            <button
              onClick={() => {
                onClose();
                onBuyNow();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              Get Instant Access ($49)
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
