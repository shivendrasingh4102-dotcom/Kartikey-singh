import React, { useState, useEffect, useCallback } from 'react';
import { SAMPLE_PRODUCTS, DEFAULT_USER } from './data/mockProducts';
import { 
  Order, 
  SignedUrlConfig, 
  WatermarkConfig, 
  EmailDispatch, 
  PipelineExecutionState, 
  LogEntry 
} from './types';
import { DEFAULT_WATERMARK_CONFIG, createDigitalProductPdf, createReceiptPdf, triggerFileDownload } from './services/pdfEngine';
import { generateS3PresignedUrl } from './services/signedUrl';
import { Header, AppTab } from './components/Header';
import { StorefrontView } from './components/StorefrontView';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { SecureDeliveryPanel } from './components/SecureDeliveryPanel';
import { ReceiptGeneratorPanel } from './components/ReceiptGeneratorPanel';
import { CustomerInbox } from './components/CustomerInbox';
import { CodeViewer } from './components/CodeViewer';
import { CheckoutSimulatorModal } from './components/CheckoutSimulatorModal';
import { LiveConsole } from './components/LiveConsole';

export default function App() {
  // Current active order
  const [currentOrder, setCurrentOrder] = useState<Order>(() => {
    const now = Date.now();
    return {
      id: 'ord_9182a4f',
      sessionId: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
      paymentStatus: 'PAID',
      createdAt: now - 1000 * 60 * 2, // 2 minutes ago
      amount: SAMPLE_PRODUCTS[0].price,
      currency: 'USD',
      paymentMethod: 'Visa',
      cardLast4: '4242',
      user: DEFAULT_USER,
      product: SAMPLE_PRODUCTS[0],
    };
  });

  // Presigned URL configuration (15-min TTL = 900s)
  const [signedUrlConfig, setSignedUrlConfig] = useState<SignedUrlConfig>(() => 
    generateS3PresignedUrl('private-digital-assets-prod', SAMPLE_PRODUCTS[0].fileKey, 900)
  );

  // Watermark configuration
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AppTab>('store');

  // Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Pipeline processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineExecutionState>({
    currentStage: 'completed',
    webhookStep: 'done',
    deliveryStep: 'done',
    receiptStep: 'done',
  });

  // System audit logs
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      level: 'info',
      tag: 'WEBHOOK',
      message: 'POST /api/webhooks/payment: Received checkout.session.completed event (Stripe Sig verified).',
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 118000).toLocaleTimeString(),
      level: 'success',
      tag: 'S3_PRESIGN',
      message: 'Branch 1: Generated 15-min presigned URL for private asset (AWS SigV4, expiresIn: 900s).',
    },
    {
      id: 'log_3',
      timestamp: new Date(Date.now() - 115000).toLocaleTimeString(),
      level: 'success',
      tag: 'PDF_WATERMARK',
      message: `Branch 1: pdf-lib stamped "Licensed to ${DEFAULT_USER.email} | Order #ord_9182a4f" across 4 pages.`,
    },
    {
      id: 'log_4',
      timestamp: new Date(Date.now() - 112000).toLocaleTimeString(),
      level: 'success',
      tag: 'RECEIPT_PDF',
      message: 'Branch 2: Compiled vectorized A4 tax invoice PDF with SHA-256 audit seal.',
    },
    {
      id: 'log_5',
      timestamp: new Date(Date.now() - 110000).toLocaleTimeString(),
      level: 'success',
      tag: 'EMAIL_SERVICE',
      message: `Dispatched 2 transactional emails (delivery link & receipt PDF attachment) to ${DEFAULT_USER.email}.`,
    },
  ]);

  // Delivered customer emails
  const [emails, setEmails] = useState<EmailDispatch[]>(() => [
    {
      id: 'email_webhook_combined_1',
      from: 'Kartikey Singh <orders@kartikeysingh.com>',
      to: DEFAULT_USER.email,
      subject: `Your Order Confirmation & E-Book Access (#ord_9182a4f)`,
      type: 'combined',
      sentAt: Date.now() - 110000,
      previewText: `Thank you for your purchase! Hi ${DEFAULT_USER.name}, your payment was successful. Click here to download your e-book (Link valid for 15 minutes)...`,
      downloadUrl: signedUrlConfig.signedUrl,
      expiresAt: signedUrlConfig.expiresAt,
      hasAttachment: true,
      attachmentName: 'Receipt-ord_9182a4f.pdf',
      read: false,
    },
    {
      id: 'email_delivery_1',
      from: 'Kartikey Singh <orders@kartikeysingh.com>',
      to: DEFAULT_USER.email,
      subject: `Your digital download is ready: ${SAMPLE_PRODUCTS[0].title}`,
      type: 'delivery',
      sentAt: Date.now() - 110000,
      previewText: 'Your licensed copy has been compiled and is ready for download. Link expires in 15 minutes...',
      downloadUrl: signedUrlConfig.signedUrl,
      expiresAt: signedUrlConfig.expiresAt,
      read: false,
    },
    {
      id: 'email_receipt_1',
      from: 'Kartikey Singh <orders@kartikeysingh.com>',
      to: DEFAULT_USER.email,
      subject: `Receipt for your purchase - Order #ord_9182a4f`,
      type: 'receipt',
      sentAt: Date.now() - 110000,
      previewText: `Thank you for your order! Official receipt Receipt-ord_9182a4f.pdf from Kartikey Singh is attached...`,
      hasAttachment: true,
      attachmentName: 'Receipt-ord_9182a4f.pdf',
      read: false,
    }
  ]);

  // Log append helper
  const addLog = useCallback((
    level: LogEntry['level'], 
    tag: LogEntry['tag'], 
    message: string
  ) => {
    const newEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      tag,
      message,
    };
    setLogs((prev) => [...prev, newEntry]);
  }, []);

  // Update watermark config
  const handleUpdateWatermarkConfig = (cfg: Partial<WatermarkConfig>) => {
    setWatermarkConfig((prev) => ({ ...prev, ...cfg }));
    addLog('info', 'PDF_WATERMARK', 'Watermarking parameters updated.');
  };

  // Regenerate fresh signed URL
  const handleRegenerateSignedUrl = () => {
    const freshConfig = generateS3PresignedUrl(
      'private-digital-assets-prod', 
      currentOrder.product.fileKey, 
      900
    );
    setSignedUrlConfig(freshConfig);
    addLog('success', 'S3_PRESIGN', `Refreshed presigned URL with new 15-minute TTL.`);
  };

  // Re-run pipeline for active order
  const handleReplayPipeline = async () => {
    setIsProcessing(true);
    setPipelineState({
      currentStage: 'webhook_received',
      webhookStep: 'processing',
      deliveryStep: 'idle',
      receiptStep: 'idle',
    });

    addLog('info', 'WEBHOOK', `[Webhook Ingress] Received POST /api/webhooks/stripe with header stripe-signature...`);

    // Step 1: Webhook signature verification and Prisma update
    await new Promise((r) => setTimeout(r, 500));
    addLog('success', 'WEBHOOK', `HMAC SHA-256 signature verified against STRIPE_WEBHOOK_SECRET.`);
    addLog('info', 'WEBHOOK', `1. Update Database Status: prisma.order.update({ where: { paymentIntentId: session.id }, data: { paymentStatus: 'PAID' } })`);

    setPipelineState((prev) => ({
      ...prev,
      currentStage: 'parallel_processing',
      webhookStep: 'done',
      deliveryStep: 'generating_url',
      receiptStep: 'rendering_html',
    }));

    // Step 2: Generate 15-min Expiring Link
    const freshUrl = generateS3PresignedUrl('private-digital-assets-prod', currentOrder.product.fileKey, 900);
    setSignedUrlConfig(freshUrl);
    await new Promise((r) => setTimeout(r, 500));
    addLog('success', 'S3_PRESIGN', `2. Generate Expiring Link: generateSecureDownloadUrl(ebookItem.product.fileKey) -> 15-min signed URL`);

    setPipelineState((prev) => ({
      ...prev,
      deliveryStep: 'watermarking_pdf',
      receiptStep: 'converting_pdf',
    }));

    // Step 3: Build PDF Receipt Buffer via PDFKit
    await new Promise((r) => setTimeout(r, 500));
    addLog('success', 'RECEIPT_PDF', `3. Build PDF Receipt: generateReceiptBuffer() via PDFKit stream into in-memory Buffer.`);

    setPipelineState((prev) => ({
      ...prev,
      deliveryStep: 'sending_email',
      receiptStep: 'dispatching_email',
    }));

    // Step 4: Resend Email Dispatch
    await new Promise((r) => setTimeout(r, 500));
    addLog('success', 'EMAIL_SERVICE', `4. Send Confirmation Email: resend.emails.send() dispatched to ${currentOrder.user.email} with e-book download link & attached Receipt-${currentOrder.id}.pdf.`);

    // Refresh inbox with unified email and sub-channel emails
    setEmails([
      {
        id: `email_webhook_${Date.now()}`,
        from: 'Kartikey Singh <orders@kartikeysingh.com>',
        to: currentOrder.user.email,
        subject: `Your Order Confirmation & E-Book Access (#${currentOrder.id})`,
        type: 'combined',
        sentAt: Date.now(),
        previewText: `Thank you for your purchase! Hi ${currentOrder.user.name}, your payment was successful. Click here to download your e-book (Link valid for 15 minutes)...`,
        downloadUrl: freshUrl.signedUrl,
        expiresAt: freshUrl.expiresAt,
        hasAttachment: true,
        attachmentName: `Receipt-${currentOrder.id}.pdf`,
        read: false,
      },
      {
        id: `email_delivery_${Date.now()}`,
        from: 'Kartikey Singh <orders@kartikeysingh.com>',
        to: currentOrder.user.email,
        subject: `Your digital download is ready: ${currentOrder.product.title}`,
        type: 'delivery',
        sentAt: Date.now(),
        previewText: 'Your licensed copy has been compiled and is ready for download. Link expires in 15 minutes...',
        downloadUrl: freshUrl.signedUrl,
        expiresAt: freshUrl.expiresAt,
        read: false,
      },
      {
        id: `email_receipt_${Date.now()}`,
        from: 'Kartikey Singh <orders@kartikeysingh.com>',
        to: currentOrder.user.email,
        subject: `Receipt for your purchase - Order #${currentOrder.id}`,
        type: 'receipt',
        sentAt: Date.now(),
        previewText: `Thank you for your order! Official receipt Receipt-${currentOrder.id}.pdf from Kartikey Singh is attached...`,
        hasAttachment: true,
        attachmentName: `Receipt-${currentOrder.id}.pdf`,
        read: false,
      }
    ]);

    setPipelineState({
      currentStage: 'completed',
      webhookStep: 'done',
      deliveryStep: 'done',
      receiptStep: 'done',
    });
    setIsProcessing(false);
  };

  // Complete a new checkout simulation
  const handleCompleteCheckout = (newOrder: Order) => {
    setCurrentOrder(newOrder);
    const freshUrl = generateS3PresignedUrl('private-digital-assets-prod', newOrder.product.fileKey, 900);
    setSignedUrlConfig(freshUrl);

    addLog('info', 'PAYMENT', `New checkout initiated for "${newOrder.product.title}" by ${newOrder.user.email}.`);
    
    // Auto-trigger full pipeline for new checkout
    handleReplayPipeline();
  };

  // Trigger watermarked download
  const handleTriggerDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      addLog('info', 'PDF_WATERMARK', `Compiling watermarked PDF for ${currentOrder.user.email}...`);
      const bytes = await createDigitalProductPdf(currentOrder.product, {
        watermark: true,
        order: currentOrder,
        config: watermarkConfig,
      });
      const filename = `${currentOrder.product.title.replace(/[^a-zA-Z0-9]/g, '_')}_Licensed_${currentOrder.id}.pdf`;
      triggerFileDownload(bytes, filename);
      addLog('success', 'PDF_WATERMARK', `Successfully streamed and downloaded ${filename}`);
    } catch (err: any) {
      addLog('error', 'PDF_WATERMARK', `Download error: ${err?.message || err}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Trigger receipt download
  const handleTriggerReceiptDownload = async () => {
    try {
      const receiptFilename = `Receipt-${currentOrder.id}.pdf`;
      addLog('info', 'RECEIPT_PDF', `Compiling Kartikey Singh official receipt PDF (${receiptFilename}) for order #${currentOrder.id}...`);
      const bytes = await createReceiptPdf(currentOrder, 'kartikey');
      triggerFileDownload(bytes, receiptFilename);
      addLog('success', 'RECEIPT_PDF', `Downloaded receipt attachment ${receiptFilename}`);
    } catch (err: any) {
      addLog('error', 'RECEIPT_PDF', `Receipt download error: ${err?.message || err}`);
    }
  };

  const handleMarkEmailRead = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, read: true } : e));
  };

  const unreadInboxCount = emails.filter((e) => !e.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentOrder={currentOrder}
        isProcessing={isProcessing}
        onNewCheckout={() => setIsCheckoutModalOpen(true)}
        onReplayPipeline={handleReplayPipeline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadInboxCount={unreadInboxCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {activeTab === 'store' && (
          <StorefrontView
            currentOrder={currentOrder}
            signedUrlConfig={signedUrlConfig}
            watermarkConfig={watermarkConfig}
            onOpenCheckout={(prod) => {
              if (prod) {
                setCurrentOrder((prev) => ({ ...prev, product: prod, amount: prod.price }));
              }
              setIsCheckoutModalOpen(true);
            }}
            onTriggerDownload={handleTriggerDownload}
            onTriggerReceiptDownload={handleTriggerReceiptDownload}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}

        {activeTab === 'pipeline' && (
          <ArchitectureFlow
            order={currentOrder}
            pipelineState={pipelineState}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onTriggerDownload={handleTriggerDownload}
            onTriggerReceiptDownload={handleTriggerReceiptDownload}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}

        {activeTab === 'delivery' && (
          <SecureDeliveryPanel
            order={currentOrder}
            signedUrlConfig={signedUrlConfig}
            watermarkConfig={watermarkConfig}
            onUpdateWatermarkConfig={handleUpdateWatermarkConfig}
            onRegenerateSignedUrl={handleRegenerateSignedUrl}
            onAddLog={addLog}
          />
        )}

        {activeTab === 'receipt' && (
          <ReceiptGeneratorPanel
            order={currentOrder}
            onNavigateToInbox={() => setActiveTab('inbox')}
            onAddLog={addLog}
          />
        )}

        {activeTab === 'inbox' && (
          <CustomerInbox
            order={currentOrder}
            emails={emails}
            signedUrlConfig={signedUrlConfig}
            watermarkConfig={watermarkConfig}
            onMarkRead={handleMarkEmailRead}
            onAddLog={addLog}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer />
        )}
      </main>

      {/* Checkout Simulator Modal */}
      <CheckoutSimulatorModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onCompleteCheckout={handleCompleteCheckout}
        defaultEmail={currentOrder.user.email}
      />

      {/* Live System Log Console Bar */}
      <LiveConsole
        logs={logs}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}
