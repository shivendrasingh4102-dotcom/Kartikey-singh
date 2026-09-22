export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  currency: string;
  pages: number;
  fileKey: string;
  fileSize: string;
  coverGradient: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  ipAddress: string;
}

export interface Order {
  id: string;
  sessionId: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED';
  createdAt: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardLast4: string;
  user: User;
  product: Product;
}

export interface SignedUrlConfig {
  bucket: string;
  key: string;
  region: string;
  expiresInSeconds: number; // 900s = 15m
  expiresAt: number;
  signedUrl: string;
  signature: string;
}

export interface WatermarkConfig {
  templateText: string;
  includeEmail: boolean;
  includeOrderId: boolean;
  includeTimestamp: boolean;
  includeIp: boolean;
  includeDiagonalWatermark: boolean;
  fontSize: number;
  opacity: number;
  positionY: number;
  colorRgb: [number, number, number];
}

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  status: 'received' | 'validating' | 'processed' | 'failed';
  signatureVerified: boolean;
  payload: any;
}

export interface EmailDispatch {
  id: string;
  from?: string;
  to: string;
  subject: string;
  type: 'delivery' | 'receipt' | 'combined';
  sentAt: number;
  previewText: string;
  downloadUrl?: string;
  expiresAt?: number;
  hasAttachment?: boolean;
  attachmentName?: string;
  read: boolean;
}

export interface PipelineExecutionState {
  currentStage: 'idle' | 'webhook_received' | 'parallel_processing' | 'completed' | 'error';
  webhookStep: 'idle' | 'processing' | 'done' | 'failed';
  deliveryStep: 'idle' | 'generating_url' | 'watermarking_pdf' | 'sending_email' | 'done' | 'failed';
  receiptStep: 'idle' | 'rendering_html' | 'converting_pdf' | 'dispatching_email' | 'done' | 'failed';
  error?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  tag: 'PAYMENT' | 'WEBHOOK' | 'S3_PRESIGN' | 'PDF_WATERMARK' | 'RECEIPT_PDF' | 'EMAIL_SERVICE';
  message: string;
  metadata?: any;
}
