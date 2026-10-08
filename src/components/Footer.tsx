/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Clock, FileCheck } from 'lucide-react';
import { Shop } from '../types';

interface FooterProps {
  shop: Shop;
}

export const Footer: React.FC<FooterProps> = ({ shop }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 px-4 mt-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-semibold text-base mb-2">{shop.name}</h3>
          <p className="text-sm leading-relaxed text-slate-400 mb-3">{shop.address}</p>
          <p className="text-xs text-slate-400">Phone: {shop.phone}</p>
          <p className="text-xs text-slate-400">Official UPI: {shop.upiId}</p>
        </div>

        <div>
          <h4 className="text-white font-medium text-sm mb-3">Security & Privacy</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Private upload storage (No public access)</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Files auto-deleted after {shop.fileRetentionHours} hours</span>
            </li>
            <li className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Zero third-party SaaS cloud print logging</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium text-sm mb-3">Shop Hours</h4>
          <p className="text-xs text-slate-300">Monday - Saturday: 8:00 AM - 10:00 PM</p>
          <p className="text-xs text-slate-300 mt-1">Sunday: 9:00 AM - 8:00 PM</p>
          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Powered by Digital Print Free-First Engine
          </div>
        </div>
      </div>
    </footer>
  );
};
