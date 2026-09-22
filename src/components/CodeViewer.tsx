import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode, CheckCircle2, Shield } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'storage' | 'download_route' | 'webhook' | 'receipt'>('storage');
  const [copied, setCopied] = useState(false);

  const files = {
    storage: {
      name: 'lib/storage.ts',
      desc: '15-minute temporary presigned URL generator for private S3 storage',
      code: `// lib/storage.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ 
  region: process.env.AWS_REGION 
});

/**
 * Generates an ephemeral presigned download URL for private digital assets.
 * URL expires in 15 minutes (900 seconds) to prevent unauthorized distribution.
 */
export async function generateSecureDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.PRIVATE_S3_BUCKET,
    Key: fileKey,
  });

  // URL expires in 15 minutes (900 seconds)
  return await getSignedUrl(s3, command, { expiresIn: 900 });
}`
    },
    download_route: {
      name: 'app/api/download/[orderId]/route.ts',
      desc: 'Next.js App Router dynamic PDF watermarking and streaming endpoint',
      code: `// app/api/download/[orderId]/route.ts
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request, 
  { params }: { params: { orderId: string } }
) {
  // 1. Verify payment status in database
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { user: true, product: true },
  });

  if (!order || order.paymentStatus !== "PAID") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Fetch original unwatermarked PDF from private storage
  const pdfBytes = await fetch(order.product.fileUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3. Watermark each page with customer email and unique order ID
  const pages = pdfDoc.getPages();
  pages.forEach((page) => {
    page.drawText(\`Licensed to \${order.user.email} | Order #\${order.id}\`, {
      x: 30,
      y: 20,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  // 4. Save and stream modified binary buffer
  const modifiedPdf = await pdfDoc.save();

  return new NextResponse(modifiedPdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": \`attachment; filename="\${order.product.title}.pdf"\`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}`
    },
    webhook: {
      name: 'app/api/webhooks/stripe/route.ts',
      desc: 'Stripe webhook orchestration with Prisma update, S3 signed URL, PDFKit receipt, and Resend delivery',
      code: `// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { generateReceiptBuffer } from "@/lib/receipt";
import { generateSecureDownloadUrl } from "@/lib/storage";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(\`Webhook Error: \${err.message}\`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // 1. Update Database Status
    const order = await prisma.order.update({
      where: { paymentIntentId: session.id },
      data: { paymentStatus: "PAID" },
      include: { user: true, items: { include: { product: true } } },
    });

    // 2. Generate Expiring Link for Digital Items
    const ebookItem = order.items.find((i) => i.product.productType === "EBOOK");
    let downloadUrl = "";
    if (ebookItem) {
      downloadUrl = await generateSecureDownloadUrl(ebookItem.product.fileKey);
    }

    // 3. Build PDF Receipt
    const receiptBuffer = await generateReceiptBuffer({
      orderId: order.id,
      customerName: order.user.name || "Valued Customer",
      items: order.items.map((i) => ({ name: i.product.title, price: i.price })),
      total: order.totalAmount,
      date: new Date().toLocaleDateString(),
    });

    // 4. Send Confirmation Email with PDF Attachment & Download Link
    await resend.emails.send({
      from: "Kartikey Singh <orders@kartikeysingh.com>",
      to: order.user.email,
      subject: \`Your Order Confirmation & E-Book Access (#\${order.id})\`,
      html: \`
        <h2>Thank you for your purchase!</h2>
        <p>Hi \${order.user.name}, your payment was successful.</p>
        \${downloadUrl ? \`<p><a href="\${downloadUrl}">Click here to download your e-book</a> (Link valid for 15 minutes).</p>\` : ""}
        <p>Your official tax receipt is attached to this email.</p>
      \`,
      attachments: [
        {
          filename: \`Receipt-\${order.id}.pdf\`,
          content: receiptBuffer,
        },
      ],
    });
  }

  return NextResponse.json({ received: true });
}`
    },
    receipt: {
      name: 'lib/receipt.ts',
      desc: 'PDFKit server-side receipt buffer generator with brand header and line items',
      code: `// lib/receipt.ts
import PDFDocument from "pdfkit";

export async function generateReceiptBuffer(orderData: {
  orderId: string;
  customerName: string;
  items: { name: string; price: number }[];
  total: number;
  date: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Brand Header
    doc.fontSize(20).text("Kartikey Singh", { align: "left" });
    doc.fontSize(10).text("Official Purchase Receipt", { align: "left" });
    doc.moveDown();

    // Order Metadata
    doc.fontSize(10).text(\`Receipt No: REC-\${orderData.orderId}\`);
    doc.text(\`Date: \${orderData.date}\`);
    doc.text(\`Customer: \${orderData.customerName}\`);
    doc.moveDown();

    // Line Items
    doc.text("--------------------------------------------------");
    orderData.items.forEach((item) => {
      doc.text(\`\${item.name} - $\${item.price.toFixed(2)}\`);
    });
    doc.text("--------------------------------------------------");
    doc.fontSize(12).text(\`Total Paid: $\${orderData.total.toFixed(2)}\`, { bold: true });

    doc.end();
  });
}`
    }
  };

  const current = files[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              Source Code Implementation
            </h2>
            <p className="text-xs text-slate-500">
              Clean TypeScript implementation matching the exact architecture specified
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Code'}
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto text-xs font-medium pb-2 border-b border-slate-100">
          {(Object.keys(files) as Array<keyof typeof files>).map((key) => {
            const f = files[key];
            const isActive = activeFile === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFile(key)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-mono ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>

        {/* File Description */}
        <div className="my-3 text-xs text-slate-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          <span>{current.desc}</span>
        </div>

        {/* Code Block */}
        <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
          <pre className="text-slate-300 leading-relaxed">
            {current.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
