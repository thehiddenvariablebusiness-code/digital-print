/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Clock, User, AlertCircle } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Security & Operational Audit Trail</h2>
        <p className="text-xs text-gray-500">
          Immutable log of all manual payment verifications, reprints, price updates, and cancellations.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin / Origin</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Change / Notes</th>
                <th className="py-3 px-4">Reason Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {log.adminEmail || log.adminId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800">
                      {log.orderId || '-'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-500 max-w-xs truncate">
                      {log.oldValue && log.newValue ? `${log.oldValue} → ${log.newValue}` : log.newValue || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-800 italic">
                      {log.reason || 'Standard operational task'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
