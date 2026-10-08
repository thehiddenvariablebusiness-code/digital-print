/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, CheckCircle2, ShieldCheck, Store } from 'lucide-react';
import { Shop, PaymentMode } from '../../types';

interface SettingsTabProps {
  shop: Shop;
  onSaveShop: (shop: Shop) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ shop: initialShop, onSaveShop }) => {
  const [formData, setFormData] = useState<Shop>(initialShop);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveShop(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Shop Settings & Configuration</h2>
        <p className="text-xs text-gray-500">
          Configure shop branding, UPI payment credentials, file retention rules, and operation modes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base mb-2">Shop Profile & Counter Location</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Shop Name (SHOP_NAME)
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Contact Phone (SHOP_PHONE)
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Store Address (SHOP_ADDRESS)
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Payment & Banking */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base mb-2">UPI Payment Setup</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Official UPI ID (SHOP_UPI_ID)
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. digitalprint@navi"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Navi, Google Pay, PhonePe, or BHIM VPA
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Payment Operation Mode
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as PaymentMode })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white font-medium"
              >
                <option value="test">Test Sandbox (Development & Simulation)</option>
                <option value="upi_qr">Navi / UPI QR (Static QR + Counter Verification)</option>
                <option value="merchant">Merchant Gateway (Automated Webhook API)</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Controls whether instant test confirmation or strict banking verification is enforced.
              </span>
            </div>
          </div>
        </div>

        {/* Security & File Retention */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base mb-2">Document Storage & Security Policies</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Automatic File Retention
              </label>
              <select
                value={formData.fileRetentionHours}
                onChange={(e) => setFormData({ ...formData, fileRetentionHours: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
              >
                <option value={1}>Delete 1 hour after print</option>
                <option value={6}>Delete after 6 hours</option>
                <option value={24}>Delete after 24 hours (Default)</option>
                <option value={168}>Retain for 7 days</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Customer files are deleted automatically for strict privacy.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Max Upload Limit (MB)
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={formData.maxFileSizeMb}
                onChange={(e) => setFormData({ ...formData, maxFileSizeMb: parseInt(e.target.value, 10) || 50 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
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
            <span>{isSaving ? 'Updating Settings...' : 'Save Configuration'}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Shop settings saved!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
