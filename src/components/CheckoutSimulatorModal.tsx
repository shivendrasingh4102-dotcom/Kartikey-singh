import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle2, Lock } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/mockProducts';
import { Product, Order } from '../types';

interface CheckoutSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteCheckout: (order: Order) => void;
  defaultEmail: string;
}

export const CheckoutSimulatorModal: React.FC<CheckoutSimulatorModalProps> = ({
  isOpen,
  onClose,
  onCompleteCheckout,
  defaultEmail,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(SAMPLE_PRODUCTS[0]);
  const [customerName, setCustomerName] = useState('Shivendra Singh');
  const [customerEmail, setCustomerEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = Date.now();
    const orderId = `ord_${Math.random().toString(36).substring(2, 9)}`;
    const sessionId = `cs_test_${Math.random().toString(36).substring(2, 18)}`;

    const newOrder: Order = {
      id: orderId,
      sessionId,
      paymentStatus: 'PAID',
      createdAt: now,
      amount: selectedProduct.price,
      currency: selectedProduct.currency,
      paymentMethod: 'Visa',
      cardLast4: '4242',
      user: {
        id: `usr_${Math.random().toString(36).substring(2, 8)}`,
        name: customerName,
        email: customerEmail,
        ipAddress: '198.51.100.42',
      },
      product: selectedProduct,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onCompleteCheckout(newOrder);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Secure E-Book Checkout</h3>
              <p className="text-[11px] text-slate-400">By Kartikey Singh • Instant 15-min S3 Delivery &amp; Receipt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Digital Product
            </label>
            <div className="space-y-2">
              {SAMPLE_PRODUCTS.map((prod) => {
                const isSelected = prod.id === selectedProduct.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{prod.title}</div>
                      <div className="text-[11px] text-slate-500">{prod.category} • {prod.pages} Pages</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-slate-900 font-mono">${prod.price.toFixed(2)}</div>
                      <span className="text-[10px] text-emerald-600 font-medium">Digital PDF</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Customer Email (Watermark Target)
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Payment Card Simulation Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Card: <strong>Visa ending in 4242</strong></span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              3D Secure Ready
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Webhook...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pay &amp; Get Instant Access (${selectedProduct.price.toFixed(2)})
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
