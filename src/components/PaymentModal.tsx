/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Order, Shop } from '../types';
import { generateQrCodeSvg } from '../lib/qrHelper';
import { claimPayment, fetchOrder, verifyPayment } from '../lib/services/apiService';

interface PaymentModalProps {
  order: Order;
  shop: Shop;
  onClose: () => void;
  onPaymentVerified: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order: initialOrder,
  shop,
  onClose,
  onPaymentVerified,
  onTrackOrder,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isSimulatingTestPay, setIsSimulatingTestPay] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);

  const isTestMode = shop.paymentMode === 'test';
  const upiId = shop.upiId || 'digitalprint@navi';
  const amountStr = order.amount.toFixed(2);
  const note = encodeURIComponent(`Order ${order.orderNumber}`);

  // NPCI standard UPI deep link
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shop.name)}&am=${amountStr}&cu=INR&tn=${note}&tr=${order.orderNumber}`;
  const qrSvgUrl = generateQrCodeSvg(upiIntentUrl, 260);

  // Poll for payment status update (waiting for VERIFIED)
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const fresh = await fetchOrder(order.orderId);
        if (fresh && isMounted) {
          setOrder(fresh);
          if (fresh.paymentStatus === 'VERIFIED') {
            onPaymentVerified(fresh);
            clearInterval(interval);
          }
        }
      } catch (_) {}
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order.orderId, onPaymentVerified]);

  // Customer clicks "I HAVE PAID" -> sets to CLAIMED (Never fake VERIFIED!)
  const handleClaimPayment = async () => {
    setIsClaiming(true);
    try {
      const updated = await claimPayment(order.orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment notice');
    } finally {
      setIsClaiming(false);
    }
  };

  // Development sandbox instant test payment simulation
  const handleSimulateTestPayment = async () => {
    setIsSimulatingTestPay(true);
    try {
      const verified = await verifyPayment(
        order.orderId,
        'test_simulation_user',
        'tester@digitalprint.dev',
        'Development Sandbox Quick Payment Simulation'
      );
      setOrder(verified);
      onPaymentVerified(verified);
    } catch (err: any) {
      alert('Test payment simulation failed: ' + err.message);
    } finally {
      setIsSimulatingTestPay(false);
    }
  };

  const copyToClipboard = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Order #{order.orderNumber}
              </span>
              {isTestMode && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  TEST SANDBOX
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold mt-1">UPI Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {order.paymentStatus === 'VERIFIED' ? (
            /* PAYMENT VERIFIED SUCCESS SCREEN */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-extrabold text-gray-900">Payment Confirmed!</h4>
              <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">
                Your payment of <strong className="text-gray-900">₹{amountStr}</strong> has been verified. The job is queued for automatic printing!
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">Dispatched to Windows Print Agent</h5>
                    <p className="text-xs text-gray-600">The shop printer will process your document momentarily.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => onTrackOrder(order)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
                >
                  Track Print Progress
                </button>
                <button
                  onClick={onClose}
                  className="py-3.5 px-5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE PAYMENT PROMPT */
            <div>
              {/* Test Mode Banner */}
              {isTestMode && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>TEST MODE — NO REAL PAYMENT</span>
                  </div>
                  <p>
                    This shop is currently running in test sandbox mode. You can test real UPI or click the button below to simulate verified payment.
                  </p>
                </div>
              )}

              {/* Amount Display */}
              <div className="text-center py-2 mb-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount to Pay</span>
                <div className="text-3xl font-black text-gray-900 mt-0.5 flex items-center justify-center gap-2">
                  <span>₹{amountStr}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(amountStr, 'amount')}
                    className="text-gray-400 hover:text-gray-700"
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500">
                  {order.pageCount} pages • {order.paperSize} {order.printType} • {order.copies} copy
                </span>
              </div>

              {/* QR Code Card */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs mb-4">
                <div className="relative p-2 bg-white rounded-xl shadow-inner border border-gray-100">
                  <img
                    src={qrSvgUrl}
                    alt="UPI Payment QR Code"
                    className="w-52 h-52 object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-3 text-center">
                    <span className="bg-white/95 px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-xs border border-gray-200">
                      BHIM • GPay • PhonePe • Navi
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-medium text-center mt-3">
                  Scan the QR code and pay the exact amount of <strong>₹{amountStr}</strong>.
                </p>

                {/* UPI ID Copy snippet */}
                <div className="mt-2.5 flex items-center gap-2 text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 max-w-full">
                  <span className="text-gray-500">UPI ID:</span>
                  <span className="font-mono font-bold text-gray-800 truncate">{upiId}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(upiId, 'upi')}
                    className="text-indigo-600 hover:text-indigo-800 ml-1 shrink-0"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Mobile UPI Deep link */}
              <div className="sm:hidden mb-4">
                <a
                  href={upiIntentUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open directly in UPI App (GPay/PhonePe)</span>
                </a>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                {order.paymentStatus === 'CLAIMED' ? (
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span>Waiting for Payment Confirmation</span>
                    </div>
                    <p className="text-slate-600">
                      Payment claim submitted! The shop counter is verifying your UPI transaction. Once confirmed, printing will begin automatically.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* IMPORTANT ANTI-FRAUD RULE (Section 6 & 7):
                        The button 'I HAVE PAID' only sets status to CLAIMED, never fake PAID! */}
                    <button
                      type="button"
                      onClick={handleClaimPayment}
                      disabled={isClaiming}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                    >
                      {isClaiming ? (
                        <span>Submitting Confirmation Request...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>I HAVE PAID (NOTIFY COUNTER)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center mt-1">
                      Pressing this alerts the shop owner to confirm your UPI payment.
                    </p>
                  </div>
                )}

                {/* TEST SIMULATION BUTTON (If in test mode) */}
                {isTestMode && (
                  <div className="pt-2 border-t border-dashed border-gray-200">
                    <button
                      type="button"
                      onClick={handleSimulateTestPayment}
                      disabled={isSimulatingTestPay}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSimulatingTestPay ? 'Processing...' : 'Complete Test Payment (Simulate Verified)'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
