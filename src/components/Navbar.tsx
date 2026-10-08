/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, Search, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { Shop } from '../types';

interface NavbarProps {
  shop: Shop;
  activeView: 'print' | 'track' | 'admin';
  onNavigate: (view: 'print' | 'track' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ shop, activeView, onNavigate }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      {/* Top micro banner for Shop Contact */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-xs sm:max-w-md">{shop.address}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{shop.phone}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-right">
            {shop.paymentMode === 'test' && (
              <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-amber-500/40">
                SANDBOX / TEST MODE
              </span>
            )}
            <span className="text-slate-400">UPI: {shop.upiId}</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('print')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition">
              {shop.name}
            </h1>
            <p className="text-xs text-gray-500">Fast QR → Print Service</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('print')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'print'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Print
          </button>

          <button
            onClick={() => onNavigate('track')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'track'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Order</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              activeView === 'admin'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
