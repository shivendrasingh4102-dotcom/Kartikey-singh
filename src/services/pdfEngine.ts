import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Product, Order, WatermarkConfig } from '../types';

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  templateText: 'Licensed to {{email}} | Order #{{orderId}}',
  includeEmail: true,
  includeOrderId: true,
  includeTimestamp: true,
  includeIp: true,
  includeDiagonalWatermark: true,
  fontSize: 9,
  opacity: 0.5,
  positionY: 20,
  colorRgb: [0.5, 0.5, 0.5],
};

/**
 * Creates a rich multi-page digital product PDF in memory,
 * with options to apply dynamic purchaser watermarking.
 */
export async function createDigitalProductPdf(
  product: Product,
  options?: {
    watermark?: boolean;
    order?: Order;
    config?: WatermarkConfig;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  const primaryColor = rgb(0.12, 0.22, 0.42);
  const darkTextColor = rgb(0.12, 0.15, 0.2);
  const mutedTextColor = rgb(0.4, 0.45, 0.5);
  const accentColor = rgb(0.2, 0.45, 0.9);

  // --- PAGE 1: TITLE & COVER ---
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header band
  page1.drawRectangle({
    x: 0,
    y: height - 160,
    width: width,
    height: 160,
    color: primaryColor,
  });

  page1.drawText('CONFIDENTIAL LICENSED EDITION', {
    x: 48,
    y: height - 55,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.9, 0.95, 1.0),
  });

  page1.drawText(product.title, {
    x: 48,
    y: height - 90,
    size: 22,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(product.subtitle, {
    x: 48,
    y: height - 118,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.8, 0.88, 0.98),
  });

  // Body content
  page1.drawText('1. Executive Overview & System Architecture', {
    x: 48,
    y: height - 200,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  const introText = [
    'This handbook outlines the standard architectural methodology for building distributed,',
    'zero-trust digital delivery systems. Modern infrastructure requires that digital assets',
    'remain fully protected from unauthorized re-distribution, hotlinking, and scraping.',
    '',
    'Core fulfillment pillars include:',
    '  - Asynchronous payment verification via signed webhooks (HMAC SHA-256).',
    '  - Ephemeral time-bound presigned storage access (15-minute maximum TTL).',
    '  - Dynamic real-time purchaser watermarking on document delivery streams.',
    '  - Automated transactional receipt generation and dual-channel dispatch.'
  ];

  let currentY = height - 230;
  introText.forEach((line) => {
    page1.drawText(line, {
      x: 48,
      y: currentY,
      size: 10,
      font: fontHelvetica,
      color: darkTextColor,
    });
    currentY -= 17;
  });

  // Code diagram box
  currentY -= 10;
  page1.drawRectangle({
    x: 48,
    y: currentY - 110,
    width: width - 96,
    height: 110,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page1.drawText('// Core Architecture Pipeline (checkout.session.completed)', {
    x: 60,
    y: currentY - 22,
    size: 9,
    font: fontCourier,
    color: rgb(0.3, 0.5, 0.3),
  });

  page1.drawText('POST /api/webhooks/stripe -> Verify Webhook Signature', {
    x: 60,
    y: currentY - 42,
    size: 9,
    font: fontCourier,
    color: darkTextColor,
  });

  page1.drawText('├── Branch 1: Secure Delivery [S3 Presigned URL (15m) + pdf-lib watermark]', {
    x: 60,
    y: currentY - 62,
    size: 9,
    font: fontCourier,
    color: accentColor,
  });

  page1.drawText('└── Branch 2: Receipt Generation [HTML to PDF + Resend/SendGrid Dispatch]', {
    x: 60,
    y: currentY - 82,
    size: 9,
    font: fontCourier,
    color: accentColor,
  });

  currentY -= 140;

  // Metadata block
  page1.drawText('Document Metadata & Verification', {
    x: 48,
    y: currentY,
    size: 12,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  currentY -= 22;
  page1.drawText(`File Key: ${product.fileKey}`, {
    x: 48,
    y: currentY,
    size: 9,
    font: fontHelvetica,
    color: mutedTextColor,
  });
  currentY -= 16;
  page1.drawText(`Category: ${product.category} | SHA-256 Checksum: 8a4f910b3e6c...`, {
    x: 48,
    y: currentY,
    size: 9,
    font: fontHelvetica,
    color: mutedTextColor,
  });

  // --- PAGE 2: SECURITY SPECIFICATION & CODE ---
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  
  page2.drawText('2. Temporary File Access Control & Presigned URLs', {
    x: 48,
    y: height - 60,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  let p2Y = height - 90;
  const p2Lines = [
    'Private cloud storage (Amazon S3 / Google Cloud Storage) buckets must prohibit public access.',
    'Access is granted strictly on-demand by generating a short-lived presigned URL. The standard',
    'expiration window is 15 minutes (900 seconds), calculated using AWS Signature Version 4.',
    '',
    'Code implementation in lib/storage.ts:'
  ];

  p2Lines.forEach((l) => {
    page2.drawText(l, {
      x: 48,
      y: p2Y,
      size: 10,
      font: fontHelvetica,
      color: darkTextColor,
    });
    p2Y -= 18;
  });

  // Code block for S3 Presigned URL
  p2Y -= 5;
  page2.drawRectangle({
    x: 48,
    y: p2Y - 140,
    width: width - 96,
    height: 140,
    color: rgb(0.1, 0.12, 0.16),
  });

  const s3Snippet = [
    'import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";',
    'import { getSignedUrl } from "@aws-sdk/s3-request-presigner";',
    '',
    'const s3 = new S3Client({ region: process.env.AWS_REGION });',
    '',
    'export async function generateSecureDownloadUrl(fileKey: string): Promise<string> {',
    '  const command = new GetObjectCommand({',
    '    Bucket: process.env.PRIVATE_S3_BUCKET,',
    '    Key: fileKey,',
    '  });',
    '  return await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes',
    '}'
  ];

  let snippetY = p2Y - 20;
  s3Snippet.forEach((code) => {
    page2.drawText(code, {
      x: 60,
      y: snippetY,
      size: 8.5,
      font: fontCourier,
      color: rgb(0.9, 0.95, 1.0),
    });
    snippetY -= 10.5;
  });

  p2Y -= 170;

  // Watermark section
  page2.drawText('3. Just-in-Time PDF Watermarking Stream', {
    x: 48,
    y: p2Y,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  p2Y -= 28;
  const wmDesc = [
    'When the customer hits /api/download/[orderId], the endpoint validates the paymentStatus in Prisma.',
    'The stream intercepts the binary buffer, loads it into pdf-lib, and iterates over every page to stamp',
    'tamper-evident licensing metadata (customer email, order ID, and timestamp).',
    'This binds the document copy to the legal purchaser and strongly deters unauthorized redistribution.'
  ];

  wmDesc.forEach((l) => {
    page2.drawText(l, {
      x: 48,
      y: p2Y,
      size: 10,
      font: fontHelvetica,
      color: darkTextColor,
    });
    p2Y -= 18;
  });

  // --- PAGE 3: RECEIPT GENERATION & PIPELINE METRICS ---
  const page3 = pdfDoc.addPage([595.28, 841.89]);
  page3.drawText('4. Transactional Receipt & Audit Trail', {
    x: 48,
    y: height - 60,
    size: 14,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  let p3Y = height - 90;
  const p3Lines = [
    'Simultaneously with delivery, the webhook orchestrator compiles an itemized PDF tax invoice.',
    'Key parameters required on every generated receipt:',
    '  • Unique Invoice Serial: INV-2026-XXXXX',
    '  • Customer Identification: Name, Email, IP Address at checkout',
    '  • Transaction Reference: Stripe Session / Payment Intent ID',
    '  • Tax compliance: Itemized Subtotal, Sales Tax / VAT calculation, Grand Total',
    '  • Automated Dispatch: Dispatched via transactional email provider with attached PDF.',
    '',
    'Notice: This document is provided under single-seat developer license.'
  ];

  p3Lines.forEach((l) => {
    page3.drawText(l, {
      x: 48,
      y: p3Y,
      size: 10,
      font: fontHelvetica,
      color: darkTextColor,
    });
    p3Y -= 20;
  });

  // Table summary
  p3Y -= 15;
  page3.drawRectangle({
    x: 48,
    y: p3Y - 90,
    width: width - 96,
    height: 90,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page3.drawText('PIPELINE PERFORMANCE BENCHMARKS', {
    x: 60,
    y: p3Y - 22,
    size: 9,
    font: fontHelveticaBold,
    color: primaryColor,
  });

  page3.drawText('• Webhook Signature Verification: ~1.2ms (crypto.timingSafeEqual)', {
    x: 60,
    y: p3Y - 42,
    size: 9,
    font: fontHelvetica,
    color: darkTextColor,
  });

  page3.drawText('• S3 Presigned URL Generation: ~4.5ms (SDK offline HMAC computation)', {
    x: 60,
    y: p3Y - 60,
    size: 9,
    font: fontHelvetica,
    color: darkTextColor,
  });

  page3.drawText('• Real-time Watermark & Stream: ~38ms for 4-page A4 document', {
    x: 60,
    y: p3Y - 78,
    size: 9,
    font: fontHelvetica,
    color: darkTextColor,
  });

  // --- WATERMARK APPLICATION (IF REQUESTED) ---
  if (options?.watermark && options.order) {
    const order = options.order;
    const config = options.config || DEFAULT_WATERMARK_CONFIG;
    const pages = pdfDoc.getPages();

    const timestampStr = new Date(order.createdAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const watermarkText = `Licensed to ${order.user.email} | Order #${order.id}${
      config.includeTimestamp ? ` | ${timestampStr}` : ''
    }${config.includeIp ? ` | IP: ${order.user.ipAddress}` : ''}`;

    const color = rgb(config.colorRgb[0], config.colorRgb[1], config.colorRgb[2]);

    pages.forEach((page, index) => {
      const pageSize = page.getSize();

      // 1. Discreet Footer Watermark (exact pattern from user prompt)
      page.drawText(watermarkText, {
        x: 30,
        y: config.positionY || 20,
        size: config.fontSize || 9,
        font: fontHelvetica,
        color: color,
      });

      // 2. Page Number
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: pageSize.width - 90,
        y: config.positionY || 20,
        size: 8.5,
        font: fontHelvetica,
        color: color,
      });

      // 3. Optional Diagonal Translucent Watermark across center of each page
      if (config.includeDiagonalWatermark) {
        page.drawText(`LICENSED TO ${order.user.email.toUpperCase()} - CONFIDENTIAL`, {
          x: 45,
          y: pageSize.height / 2 - 40,
          size: 15,
          font: fontHelveticaBold,
          color: rgb(0.85, 0.87, 0.9),
          rotate: degrees(35),
          opacity: 0.28,
        });
      }
    });
  }

  return await pdfDoc.save();
}

export interface ReceiptOrderData {
  orderId: string;
  customerName: string;
  items: { name: string; price: number }[];
  total: number;
  date: string;
}

/**
 * Generates receipt matching the PDFKit implementation from lib/receipt.ts:
 * Brand Header: "Kartikey Singh"
 * "Official Purchase Receipt"
 * Receipt No: REC-{orderId}
 * Date: {date}
 * Customer: {customerName}
 * Line Items & Total Paid
 */
export async function generateKartikeyReceiptPdf(orderData: ReceiptOrderData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Standard Letter page with 50pt margin as in PDFDocument({ margin: 50 })
  const page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();
  const margin = 50;
  let curY = height - margin;

  // Brand Header
  page.drawText("Kartikey Singh", {
    x: margin,
    y: curY - 20,
    size: 20,
    font: fontHelveticaBold,
    color: rgb(0.08, 0.08, 0.08),
  });
  curY -= 28;

  page.drawText("Official Purchase Receipt", {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.35, 0.35, 0.35),
  });
  curY -= 26; // doc.moveDown()

  // Order Metadata
  page.drawText(`Receipt No: REC-${orderData.orderId}`, {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  curY -= 16;

  page.drawText(`Date: ${orderData.date}`, {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  curY -= 16;

  page.drawText(`Customer: ${orderData.customerName}`, {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.15, 0.15, 0.15),
  });
  curY -= 28; // doc.moveDown()

  // Line Items
  const separator = "--------------------------------------------------";
  page.drawText(separator, {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontCourier,
    color: rgb(0.35, 0.35, 0.35),
  });
  curY -= 18;

  orderData.items.forEach((item) => {
    page.drawText(`${item.name} - $${item.price.toFixed(2)}`, {
      x: margin,
      y: curY - 10,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.12, 0.12, 0.12),
    });
    curY -= 18;
  });

  page.drawText(separator, {
    x: margin,
    y: curY - 10,
    size: 10,
    font: fontCourier,
    color: rgb(0.35, 0.35, 0.35),
  });
  curY -= 24;

  // Total Paid
  page.drawText(`Total Paid: $${orderData.total.toFixed(2)}`, {
    x: margin,
    y: curY - 12,
    size: 12,
    font: fontHelveticaBold,
    color: rgb(0.05, 0.05, 0.05),
  });

  return await pdfDoc.save();
}

/**
 * Creates an official PDF Tax Receipt / Invoice for the completed order
 */
export async function createReceiptPdf(order: Order, template: 'kartikey' | 'detailed' = 'kartikey'): Promise<Uint8Array> {
  if (template === 'kartikey') {
    return await generateKartikeyReceiptPdf({
      orderId: order.id.replace('ord_', ''),
      customerName: order.user.name,
      items: [{ name: order.product.title, price: order.product.price }],
      total: order.amount,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  }

  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.Courier);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const brandColor = rgb(0.12, 0.22, 0.42);
  const grayText = rgb(0.4, 0.45, 0.5);
  const darkText = rgb(0.15, 0.17, 0.2);

  // Top header bar
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.97, 0.98, 1.0),
  });

  page.drawText('OFFICIAL RECEIPT / TAX INVOICE', {
    x: 48,
    y: height - 50,
    size: 18,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText(`Invoice #${order.id.replace('ord_', 'INV-2026-')}`, {
    x: 48,
    y: height - 72,
    size: 10,
    font: fontHelvetica,
    color: grayText,
  });

  page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, {
    x: 48,
    y: height - 90,
    size: 10,
    font: fontHelvetica,
    color: grayText,
  });

  // Paid Stamp Badge
  page.drawRectangle({
    x: width - 150,
    y: height - 85,
    width: 102,
    height: 34,
    color: rgb(0.9, 0.98, 0.92),
    borderColor: rgb(0.15, 0.65, 0.3),
    borderWidth: 1.5,
  });

  page.drawText('PAID IN FULL', {
    x: width - 138,
    y: height - 64,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.55, 0.25),
  });

  // Billing Details Section
  let curY = height - 160;

  // Merchant info (left)
  page.drawText('ISSUED BY:', {
    x: 48,
    y: curY,
    size: 9,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText('CloudDeliver Inc.\n100 Montgomery St, Suite 2400\nSan Francisco, CA 94104\nVAT: US-849201948', {
    x: 48,
    y: curY - 18,
    size: 9.5,
    font: fontHelvetica,
    color: darkText,
    lineHeight: 14,
  });

  // Customer info (right)
  page.drawText('BILLED TO:', {
    x: 320,
    y: curY,
    size: 9,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText(`${order.user.name}\n${order.user.email}\nCustomer ID: ${order.user.id}\nIP at Checkout: ${order.user.ipAddress}`, {
    x: 320,
    y: curY - 18,
    size: 9.5,
    font: fontHelvetica,
    color: darkText,
    lineHeight: 14,
  });

  // Table Headers
  curY -= 100;
  page.drawRectangle({
    x: 48,
    y: curY - 24,
    width: width - 96,
    height: 24,
    color: rgb(0.93, 0.95, 0.98),
  });

  page.drawText('ITEM DESCRIPTION', {
    x: 58,
    y: curY - 16,
    size: 8.5,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText('QTY', {
    x: 360,
    y: curY - 16,
    size: 8.5,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText('RATE', {
    x: 420,
    y: curY - 16,
    size: 8.5,
    font: fontHelveticaBold,
    color: brandColor,
  });

  page.drawText('AMOUNT', {
    x: 485,
    y: curY - 16,
    size: 8.5,
    font: fontHelveticaBold,
    color: brandColor,
  });

  // Item row
  curY -= 32;
  page.drawText(order.product.title, {
    x: 58,
    y: curY - 12,
    size: 9.5,
    font: fontHelveticaBold,
    color: darkText,
  });

  page.drawText(`Single-seat developer license (PDF Electronic Delivery)`, {
    x: 58,
    y: curY - 26,
    size: 8.5,
    font: fontHelvetica,
    color: grayText,
  });

  page.drawText('1', {
    x: 365,
    y: curY - 16,
    size: 9.5,
    font: fontHelvetica,
    color: darkText,
  });

  page.drawText(`$${order.product.price.toFixed(2)}`, {
    x: 420,
    y: curY - 16,
    size: 9.5,
    font: fontHelvetica,
    color: darkText,
  });

  page.drawText(`$${order.product.price.toFixed(2)}`, {
    x: 485,
    y: curY - 16,
    size: 9.5,
    font: fontHelveticaBold,
    color: darkText,
  });

  // Subtotal & Totals breakdown
  curY -= 65;
  page.drawLine({
    start: { x: 48, y: curY },
    end: { x: width - 48, y: curY },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });

  curY -= 20;
  const taxRate = 0.0825;
  const taxAmount = order.product.price * taxRate;
  const grandTotal = order.product.price + taxAmount;

  page.drawText('Subtotal:', {
    x: 380,
    y: curY,
    size: 9,
    font: fontHelvetica,
    color: grayText,
  });
  page.drawText(`$${order.product.price.toFixed(2)}`, {
    x: 485,
    y: curY,
    size: 9,
    font: fontHelvetica,
    color: darkText,
  });

  curY -= 18;
  page.drawText('Estimated Tax (8.25%):', {
    x: 380,
    y: curY,
    size: 9,
    font: fontHelvetica,
    color: grayText,
  });
  page.drawText(`$${taxAmount.toFixed(2)}`, {
    x: 485,
    y: curY,
    size: 9,
    font: fontHelvetica,
    color: darkText,
  });

  curY -= 24;
  page.drawRectangle({
    x: 360,
    y: curY - 8,
    width: width - 408,
    height: 28,
    color: rgb(0.95, 0.97, 1.0),
  });

  page.drawText('Total Paid:', {
    x: 375,
    y: curY + 2,
    size: 11,
    font: fontHelveticaBold,
    color: brandColor,
  });
  page.drawText(`$${grandTotal.toFixed(2)} USD`, {
    x: 470,
    y: curY + 2,
    size: 11,
    font: fontHelveticaBold,
    color: brandColor,
  });

  // Payment Transaction Details
  curY -= 60;
  page.drawText('PAYMENT METHOD & GATEWAY VERIFICATION', {
    x: 48,
    y: curY,
    size: 9,
    font: fontHelveticaBold,
    color: brandColor,
  });

  curY -= 18;
  page.drawText(`Payment Method: ${order.paymentMethod} ending in ${order.cardLast4} | Gateway: Stripe (Session: ${order.sessionId})`, {
    x: 48,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: darkText,
  });

  curY -= 16;
  page.drawText(`Digital Delivery Dispatch: 15-min Presigned URL sent to ${order.user.email}`, {
    x: 48,
    y: curY,
    size: 8.5,
    font: fontHelvetica,
    color: darkText,
  });

  // Footer notes & anti-tamper hash
  page.drawText('Questions about this invoice? Contact billing@clouddeliver.io | Terms of service apply.', {
    x: 48,
    y: 35,
    size: 8,
    font: fontHelvetica,
    color: grayText,
  });

  page.drawText(`CRYPTOGRAPHIC AUDIT HASH: sha256:${order.id}-9f82ab47c1840e9d`, {
    x: 48,
    y: 22,
    size: 7.5,
    font: fontCourier,
    color: rgb(0.55, 0.6, 0.65),
  });

  return await pdfDoc.save();
}

/**
 * Browser helper to trigger instant file download from Uint8Array
 */
export function triggerFileDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Creates an object URL for previewing in iframe / PDF viewer
 */
export function createPdfBlobUrl(bytes: Uint8Array): string {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
