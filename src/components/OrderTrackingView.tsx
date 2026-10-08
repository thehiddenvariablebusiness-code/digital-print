/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Order, PrintStatus } from '../types';
import { trackOrderByPhone, fetchOrder } from '../lib/services/apiService';

interface OrderTrackingViewProps {
  initialOrder?: Order | null;
  onSelectOrderToPay?: (order: Order) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrder,
  onSelectOrderToPay,
}) => {
  const [orderNumber, setOrderNumber] = useState<string>(initialOrder?.orderNumber || '');
  const [phone, setPhone] = useState<string>(initialOrder?.customerPhone || '');
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMsg('Please enter both your Order Number and Registered Mobile Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await trackOrderByPhone(orderNumber.trim(), phone.trim());
      if (!res) {
        setErrorMsg('No matching order found. Please check your order number and mobile number.');
        setOrder(null);
      } else {
        setOrder(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Order lookup failed.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh order status every 3 seconds if an order is active
  useEffect(() => {
    if (!order) return;
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchOrder(order.orderId);
        if (fresh && isMounted) {
          setOrder(fresh);
        }
      } catch (_) {}
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order?.orderId]);

  // Stepper state determination
  const isFileReceived = true;
  const isPaymentConfirmed = order?.paymentStatus === 'VERIFIED';
  const isQueued = order?.printStatus === 'QUEUED' || order?.printStatus === 'DOWNLOADING' || order?.printStatus === 'PRINTING' || order?.printStatus === 'COMPLETED';
  const isPrinting = order?.printStatus === 'PRINTING' || order?.printStatus === 'COMPLETED';
  const isCompleted = order?.printStatus === 'COMPLETED';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900">Track Your Print Order</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your order number and phone number to monitor live print progress.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Order Number
            </label>
            <input
              type="text"
              placeholder="e.g. DP-20261008-0001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'Track Order'}</span>
        </button>
      </form>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-indigo-300">Print Order</span>
                <h3 className="text-xl font-black">{order.orderNumber}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-indigo-300">Total Amount</span>
                <p className="text-2xl font-black text-emerald-400">₹{order.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-900 flex flex-wrap gap-4 text-xs text-indigo-200">
              <span>Customer: <strong>{order.customerName}</strong></span>
              <span>File: <strong>{order.fileName}</strong></span>
              <span>Pages: <strong>{order.pageCount} × {order.copies}</strong></span>
              <span>Specs: <strong>{order.paperSize} • {order.printType} • {order.duplex}</strong></span>
            </div>
          </div>

          {/* Stepper Timeline (Section 16 requirement) */}
          <div className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Live Print Pipeline</h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {/* Step 1: File Received */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isFileReceived ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">File Received & Validated</h5>
                  <p className="text-xs text-gray-500">Document uploaded securely to print queue storage.</p>
                </div>
              </div>

              {/* Step 2: Payment Confirmation */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isPaymentConfirmed
                    ? 'bg-emerald-600 text-white'
                    : order.paymentStatus === 'CLAIMED'
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-amber-500 text-white'
                }`}>
                  {isPaymentConfirmed ? '✓' : order.paymentStatus === 'CLAIMED' ? '⌛' : '●'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-gray-900">Payment Status</h5>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isPaymentConfirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.paymentStatus === 'CLAIMED'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isPaymentConfirmed
                      ? 'Payment confirmed and verified by shop backend.'
                      : order.paymentStatus === 'CLAIMED'
                      ? 'Payment claim submitted. Shop owner is reviewing UPI receipt.'
                      : 'Pending payment of ₹' + order.amount.toFixed(2) + ' via UPI.'}
                  </p>

                  {!isPaymentConfirmed && onSelectOrderToPay && (
                    <button
                      type="button"
                      onClick={() => onSelectOrderToPay(order)}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                    >
                      <span>Open UPI Payment QR</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step 3: Print Queue */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isQueued ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isQueued ? '✓' : '○'}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Added to Print Queue</h5>
                  <p className="text-xs text-gray-500">
                    {isQueued ? 'Job registered in shop printer queue.' : 'Awaiting verified payment.'}
                  </p>
                </div>
              </div>

              {/* Step 4: Printing */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isPrinting
                    ? 'bg-indigo-600 text-white animate-spin'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : isPrinting ? '●' : '○'}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Printing in Progress</h5>
                  <p className="text-xs text-gray-500">
                    {order.printStatus === 'PRINTING'
                      ? 'Windows Print Agent is currently spooling pages to the physical printer.'
                      : isCompleted
                      ? 'All pages have been spooled and printed.'
                      : 'Next in line on the shop printer.'}
                  </p>
                </div>
              </div>

              {/* Step 5: Completed */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : '○'}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-gray-900">Ready for Counter Pickup</h5>
                  <p className="text-xs text-gray-500">
                    {isCompleted
                      ? 'Your print job is ready! Please collect your sheets from the front desk.'
                      : 'Collect your print from the counter once complete.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ready Callout Banner */}
            {isCompleted && (
              <div className="mt-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-emerald-950 text-base">Your Prints Are Ready!</h5>
                  <p className="text-xs text-emerald-800">
                    Please visit the shop counter and mention Order #{order.orderNumber} to collect your sheets.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
