/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Terminal, Shield, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase/config';
import { Shop } from '../types';

interface SetupNoticeProps {
  shop: Shop;
}

export const SetupNotice: React.FC<SetupNoticeProps> = ({ shop }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] tracking-wider">
            {shop.paymentMode === 'test' ? 'Sandbox Mode' : 'Live UPI Mode'}
          </span>
          <span className="font-medium">
            System Operational • Print Agent: Simulated / Windows Spooler Ready • UPI ID: {shop.upiId}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
        >
          <span>Deployment &amp; Setup Guide</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Shop Counter QR &amp; UPI</span>
            </h5>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Set your Navi or merchant UPI VPA in <strong>Admin → Shop Settings</strong>. The customer sees the exact amount and UPI deep link automatically.
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>2. Windows Print Agent</span>
            </h5>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Run the agent daemon in <code>/print-agent</code> on your shop Windows computer with <code>npm start</code> or double-click <code>run-agent.bat</code>.
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>3. Cloud &amp; Security</span>
            </h5>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Anti-fraud enabled: Server-side pricing recalculation, private file storage, and atomic queue claiming prevents double-prints.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
