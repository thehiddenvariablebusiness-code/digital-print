/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, TrendingUp, BarChart2, PieChart } from 'lucide-react';
import { Order } from '../../types';

interface ReportsTabProps {
  orders: Order[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ orders }) => {
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'VERIFIED');
  const totalRevenue = verifiedOrders.reduce((sum, o) => sum + o.amount, 0);

  // Group by paper & mode
  const a4BwCount = verifiedOrders.filter((o) => o.paperSize === 'A4' && o.printType === 'BW').length;
  const a4ColorCount = verifiedOrders.filter((o) => o.paperSize === 'A4' && o.printType === 'COLOR').length;
  const a3Count = verifiedOrders.filter((o) => o.paperSize === 'A3').length;

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'File', 'Pages', 'Copies', 'Paper', 'Mode', 'Amount', 'Payment Status', 'Print Status'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.fileName}"`,
      o.pageCount,
      o.copies,
      o.paperSize,
      o.printType,
      o.amount,
      o.paymentStatus,
      o.printStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_print_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Analytics & Financial Reports</h2>
          <p className="text-xs text-gray-500">
            Daily performance metrics, customer volume, and transaction exports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export All Orders (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">A4 Black & White</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{a4BwCount} orders</div>
          <span className="text-xs text-gray-500">Standard document Xerox/notes</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">A4 Colour</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{a4ColorCount} orders</div>
          <span className="text-xs text-gray-500">Presentations, certificates & flyers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase">A3 Large Format</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{a3Count} orders</div>
          <span className="text-xs text-gray-500">Architectural sheets & posters</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-bold text-gray-900 text-base mb-4">Financial Summary</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Orders Logged:</span>
            <span className="font-bold text-gray-900">{orders.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Verified Paid Orders:</span>
            <span className="font-bold text-emerald-600">{verifiedOrders.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Net Revenue:</span>
            <span className="font-black text-gray-900 text-base">₹{totalRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Average Order Value:</span>
            <span className="font-bold text-gray-900">
              ₹{verifiedOrders.length > 0 ? (totalRevenue / verifiedOrders.length).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
