/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  Printer,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { Order, PrintJob, AdminUser } from '../../types';

interface DashboardTabProps {
  orders: Order[];
  jobs: PrintJob[];
  admin: AdminUser;
  onVerifyPayment: (order: Order, reason: string) => void;
  onRetryJob: (job: PrintJob) => void;
  onCancelJob: (job: PrintJob, reason: string) => void;
  onRefresh: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  jobs,
  admin,
  onVerifyPayment,
  onRetryJob,
  onCancelJob,
  onRefresh,
  onNavigateToTab,
}) => {
  const [selectedOrderForVerify, setSelectedOrderForVerify] = useState<Order | null>(null);
  const [verifyReason, setVerifyReason] = useState<string>('Confirmed cash/UPI credit on shop counter');

  // KPI Calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'VERIFIED')
    .reduce((sum, o) => sum + o.amount, 0);

  const totalPagesPrinted = orders
    .filter((o) => o.printStatus === 'COMPLETED')
    .reduce((sum, o) => sum + (o.pageCount * o.copies), 0);

  const pendingPayments = orders.filter((o) => o.paymentStatus === 'PENDING' || o.paymentStatus === 'CLAIMED');
  const queuedJobs = jobs.filter((j) => j.status === 'QUEUED');
  const printingJobs = jobs.filter((j) => j.status === 'PRINTING' || j.status === 'DOWNLOADING' || j.status === 'CLAIMED');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const failedJobs = jobs.filter((j) => j.status === 'FAILED');

  const handleConfirmVerification = () => {
    if (!selectedOrderForVerify) return;
    onVerifyPayment(selectedOrderForVerify, verifyReason);
    setSelectedOrderForVerify(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Shop Overview</h2>
          <p className="text-xs text-gray-500">
            Real-time status of store transactions, print queue, and hardware agent.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">₹{totalRevenue.toFixed(2)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">From {orders.filter(o => o.paymentStatus === 'VERIFIED').length} verified orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pages Printed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalPagesPrinted}</div>
          <span className="text-[11px] text-indigo-600 font-semibold">{completedJobs.length} jobs completed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingPayments.length}</div>
          <span className="text-[11px] text-amber-700 font-semibold">
            {orders.filter(o => o.paymentStatus === 'CLAIMED').length} claimed awaiting review
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Queue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{queuedJobs.length + printingJobs.length}</div>
          <span className="text-[11px] text-blue-700 font-semibold">
            {printingJobs.length} printing • {queuedJobs.length} queued
          </span>
        </div>
      </div>

      {/* Action Required: Pending Payment Claims Banner */}
      {orders.filter(o => o.paymentStatus === 'CLAIMED').length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                {orders.filter(o => o.paymentStatus === 'CLAIMED').length} Customer Payment Claim(s) Awaiting Review
              </h4>
              <p className="text-xs text-amber-800">
                Customers tapped &quot;I HAVE PAID&quot;. Verify bank SMS / soundbox and approve to initiate printing.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
          >
            Review Claims
          </button>
        </div>
      )}

      {/* Live Print Queue Table (Section 13 requirement) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Live Print & Order Queue</h3>
            <p className="text-xs text-gray-500">Real-time status stream across shop orders</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Sync</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Print Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No orders placed yet today.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order) => {
                  const job = jobs.find((j) => j.orderId === order.orderId);

                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{order.pageCount}p × {order.copies}c</div>
                        <div className="text-[11px] text-gray-400">{order.paperSize} {order.printType} • {order.duplex}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ₹{order.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.paymentStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'CLAIMED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.printStatus === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.printStatus === 'PRINTING' || order.printStatus === 'DOWNLOADING'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.printStatus === 'QUEUED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.printStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {order.paymentStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => setSelectedOrderForVerify(order)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
                          >
                            Verify Pay
                          </button>
                        )}

                        {job && job.status === 'FAILED' && (
                          <button
                            onClick={() => onRetryJob(job)}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                          >
                            Retry
                          </button>
                        )}

                        <a
                          href={`/api/files/${order.storagePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-[11px] inline-block"
                        >
                          View File
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Verification Modal */}
      {selectedOrderForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Verify Payment for #{selectedOrderForVerify.orderNumber}</span>
              </h4>
              <button
                onClick={() => setSelectedOrderForVerify(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <p>Customer: <strong>{selectedOrderForVerify.customerName}</strong> ({selectedOrderForVerify.customerPhone})</p>
              <p className="mt-1">Amount Due: <strong className="text-emerald-700 text-sm">₹{selectedOrderForVerify.amount.toFixed(2)}</strong></p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Audit Reason (Required)
              </label>
              <input
                type="text"
                required
                value={verifyReason}
                onChange={(e) => setVerifyReason(e.target.value)}
                placeholder="e.g. Received UPI credit / cash at counter"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Recorded into audit logs alongside Admin ID: {admin.email}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmVerification}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                Confirm & Dispatch to Printer
              </button>
              <button
                onClick={() => setSelectedOrderForVerify(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
