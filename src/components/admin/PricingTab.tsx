/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PricingConfig } from '../../types';

interface PricingTabProps {
  pricing: PricingConfig;
  onSavePricing: (pricing: PricingConfig) => Promise<void>;
}

export const PricingTab: React.FC<PricingTabProps> = ({ pricing: initialPricing, onSavePricing }) => {
  const [formData, setFormData] = useState<PricingConfig>(initialPricing);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSavePricing(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to update pricing: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Pricing Management</h2>
          <p className="text-xs text-gray-500">
            Configure per-sheet and per-page rates. All orders are validated server-side against these rates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* A4 Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
          <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">A4</span>
            <span>A4 Document Rates (₹ per page/sheet)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A4 B&W Single Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a4BwSingle}
                  onChange={(e) => setFormData({ ...formData, a4BwSingle: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A4 B&W Double Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a4BwDouble}
                  onChange={(e) => setFormData({ ...formData, a4BwDouble: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A4 Colour Single Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a4ColorSingle}
                  onChange={(e) => setFormData({ ...formData, a4ColorSingle: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A4 Colour Double Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a4ColorDouble}
                  onChange={(e) => setFormData({ ...formData, a4ColorDouble: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* A3 Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
          <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">A3</span>
            <span>A3 Large Format Rates (₹ per page/sheet)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A3 B&W Single Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a3BwSingle}
                  onChange={(e) => setFormData({ ...formData, a3BwSingle: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A3 B&W Double Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a3BwDouble}
                  onChange={(e) => setFormData({ ...formData, a3BwDouble: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A3 Colour Single Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a3ColorSingle}
                  onChange={(e) => setFormData({ ...formData, a3ColorSingle: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">A3 Colour Double Side</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.a3ColorDouble}
                  onChange={(e) => setFormData({ ...formData, a3ColorDouble: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Services */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
          <h3 className="font-bold text-gray-900 text-base mb-4">Specialty Print Services (₹)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Glossy Photo Print</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  value={formData.photoPrint || 30}
                  onChange={(e) => setFormData({ ...formData, photoPrint: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">ID/Passport Photo Set</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  value={formData.idPhoto || 50}
                  onChange={(e) => setFormData({ ...formData, idPhoto: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Resume Print (100gsm)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  value={formData.resumePrint || 10}
                  onChange={(e) => setFormData({ ...formData, resumePrint: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Scan Per Page</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  value={formData.scanPerPage || 5}
                  onChange={(e) => setFormData({ ...formData, scanPerPage: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Rate Card Changes'}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Prices updated and synced to database!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
