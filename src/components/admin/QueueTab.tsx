/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Printer, RefreshCw, AlertCircle, CheckCircle2, RotateCcw, XCircle, Clock } from 'lucide-react';
import { PrintJob, AdminUser } from '../../types';

interface QueueTabProps {
  jobs: PrintJob[];
  admin: AdminUser;
  onRetryJob: (job: PrintJob) => void;
  onCancelJob: (job: PrintJob, reason: string) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({ jobs, admin, onRetryJob, onCancelJob }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [cancelModalJob, setCancelModalJob] = useState<PrintJob | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Cancelled by shop admin');

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['QUEUED', 'CLAIMED', 'DOWNLOADING', 'PRINTING'].includes(job.status);
    return job.status === filter;
  });

  const confirmCancel = () => {
    if (!cancelModalJob) return;
    onCancelJob(cancelModalJob, cancelReason);
    setCancelModalJob(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Windows Print Spooler Queue</h2>
          <p className="text-xs text-gray-500">
            Real-time feed of jobs claimed and printed by the shop&apos;s Windows Print Agent.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'ACTIVE', 'QUEUED', 'PRINTING', 'COMPLETED', 'FAILED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Job ID / Order</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Printer</th>
                <th className="py-3 px-4">Agent Lock</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No print jobs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-gray-900">{job.orderNumber}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{job.jobId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 max-w-xs truncate" title={job.fileName}>
                        {job.fileName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {job.pageCount}p • {job.paperSize} {job.printType} • {job.copies}c
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800">
                        {job.windowsPrinterName || 'Default Spooler'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {job.claimedByAgentId ? (
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {job.claimedByAgentId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unclaimed (In Queue)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${job.attempts > 1 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {job.attempts} / {job.maxAttempts}
                      </span>
                      {job.errorMessage && (
                        <div className="text-[10px] text-red-600 truncate max-w-xs" title={job.errorMessage}>
                          {job.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'PRINTING' || job.status === 'DOWNLOADING' || job.status === 'CLAIMED'
                            ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                            : job.status === 'QUEUED'
                            ? 'bg-blue-100 text-blue-800'
                            : job.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {job.status === 'FAILED' && (
                        <button
                          onClick={() => onRetryJob(job)}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs"
                        >
                          Retry Print
                        </button>
                      )}
                      {(job.status === 'QUEUED' || job.status === 'FAILED') && (
                        <button
                          onClick={() => setCancelModalJob(job)}
                          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Cancel Job #{cancelModalJob.orderNumber}</span>
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to cancel this job? This will be recorded into the shop audit trail.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Cancellation Reason
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setCancelModalJob(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
