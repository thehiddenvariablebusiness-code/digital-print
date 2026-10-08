/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, CheckCircle2, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import { Order, AdminUser } from '../../types';

interface OrdersTabProps {
  orders: Order[];
  admin: AdminUser;
  onVerifyPayment: (order: Order, reason: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, admin, onVerifyPayment }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verifyModalOrder, setVerifyModalOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState<string>('Verified via shop counter UPI soundbox');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      order.paymentStatus === statusFilter ||
      order.printStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const confirmVerify = () => {
    if (!verifyModalOrder) return;
    onVerifyPayment(verifyModalOrder, reason);
    setVerifyModalOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Order Management</h2>
          <p className="text-xs text-gray-500">
            Search, filter, and review all customer document print orders.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order #, Name, Phone, or File..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 focus:outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="CLAIMED">Claimed Payments (Pending Review)</option>
            <option value="PENDING">Pending Payment</option>
            <option value="VERIFIED">Verified Paid</option>
            <option value="QUEUED">Queued for Print</option>
            <option value="COMPLETED">Print Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date/Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Print Specs</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Print</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate" title={order.fileName}>
                      {order.fileName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span>{order.pageCount}p × {order.copies}c ({order.paperSize} {order.printType})</span>
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
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
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
                            : order.printStatus === 'PRINTING'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.printStatus === 'QUEUED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.printStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {order.paymentStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => setVerifyModalOrder(order)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs"
                        >
                          Verify Pay
                        </button>
                      )}
                      <a
                        href={`/api/files/${order.storagePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-[11px] inline-block"
                      >
                        File
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verify Payment for #{verifyModalOrder.orderNumber}</span>
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Confirming this will mark payment status as VERIFIED and immediately queue the document for printing on the Windows Print Agent.
            </p>

            <div className="p-3 bg-gray-50 rounded-xl mb-4 text-xs">
              <p>Amount: <strong className="text-emerald-700 text-sm">₹{verifyModalOrder.amount.toFixed(2)}</strong></p>
              <p>Customer: <strong>{verifyModalOrder.customerName}</strong> ({verifyModalOrder.customerPhone})</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Reason / Reference Note
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmVerify}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Verification
              </button>
              <button
                onClick={() => setVerifyModalOrder(null)}
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
