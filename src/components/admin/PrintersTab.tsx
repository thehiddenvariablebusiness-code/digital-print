/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, Check, Star, Wifi, WifiOff, Terminal, ShieldAlert } from 'lucide-react';
import { Printer as PrinterType } from '../../types';

interface PrintersTabProps {
  printers: PrinterType[];
  onSetDefault: (printerId: string) => void;
}

export const PrintersTab: React.FC<PrintersTabProps> = ({ printers, onSetDefault }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Windows Printers</h2>
        <p className="text-xs text-gray-500">
          Hardware discovered and controlled by the shop&apos;s Windows Print Agent daemon.
        </p>
      </div>

      {/* Discovered Printers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {printers.map((p) => (
          <div
            key={p.printerId}
            className={`bg-white rounded-3xl border p-6 shadow-xs relative transition ${
              p.isDefault ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  p.isDefault ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">Windows Driver: {p.windowsPrinterName}</p>
                </div>
              </div>

              {p.isDefault && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Star className="w-3.5 h-3.5 fill-indigo-600" />
                  <span>Default</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Spooler Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{p.status}</span>
                </span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Capabilities</span>
                <span className="font-bold text-gray-800 mt-0.5 block">
                  {p.supportsColor ? 'Colour + B&W' : 'B&W only'} • {p.supportsDuplex ? 'Duplex' : 'Single'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-400">
                Heartbeat: {new Date(p.lastHeartbeat).toLocaleTimeString()}
              </span>

              {!p.isDefault ? (
                <button
                  onClick={() => onSetDefault(p.printerId)}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 font-bold transition cursor-pointer"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-indigo-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Active Default</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Windows Agent Connection Guide Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">How to connect the Windows Print Agent</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              The Windows Print Agent runs directly on the shop&apos;s Windows computer (next to the printer). It automatically synchronizes installed printer drivers with this dashboard.
            </p>

            <div className="mt-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
              <div>cd print-agent</div>
              <div>npm install</div>
              <div>npm start   # Or double-click run-agent.bat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
