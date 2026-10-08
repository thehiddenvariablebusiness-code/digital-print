/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Printer,
  Sliders,
  DollarSign,
  BarChart3,
  QrCode,
  ShieldAlert,
  LogOut,
  Store,
} from 'lucide-react';
import { AdminUser, Shop, PricingConfig, Order, PrintJob, Printer as PrinterType, AuditLog } from '../../types';
import { DashboardTab } from './DashboardTab';
import { OrdersTab } from './OrdersTab';
import { QueueTab } from './QueueTab';
import { PrintersTab } from './PrintersTab';
import { PricingTab } from './PricingTab';
import { SettingsTab } from './SettingsTab';
import { ReportsTab } from './ReportsTab';
import { QRGeneratorTab } from './QRGeneratorTab';
import { AuditLogsTab } from './AuditLogsTab';

interface AdminLayoutProps {
  admin: AdminUser;
  shop: Shop;
  pricing: PricingConfig;
  orders: Order[];
  jobs: PrintJob[];
  printers: PrinterType[];
  logs: AuditLog[];
  onLogout: () => void;
  onVerifyPayment: (order: Order, reason: string) => void;
  onRetryJob: (job: PrintJob) => void;
  onCancelJob: (job: PrintJob, reason: string) => void;
  onSavePricing: (pricing: PricingConfig) => Promise<void>;
  onSaveShop: (shop: Shop) => Promise<void>;
  onSetDefaultPrinter: (printerId: string) => void;
  onRefreshData: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  shop,
  pricing,
  orders,
  jobs,
  printers,
  logs,
  onLogout,
  onVerifyPayment,
  onRetryJob,
  onCancelJob,
  onSavePricing,
  onSaveShop,
  onSetDefaultPrinter,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter((o) => o.paymentStatus === 'CLAIMED').length },
    { id: 'queue', label: 'Print Queue', icon: Printer, badge: jobs.filter((j) => j.status === 'QUEUED' || j.status === 'PRINTING').length },
    { id: 'printers', label: 'Windows Printers', icon: Sliders },
    { id: 'pricing', label: 'Pricing Rules', icon: DollarSign },
    { id: 'settings', label: 'Shop Settings', icon: Store },
    { id: 'reports', label: 'Reports & Revenue', icon: BarChart3 },
    { id: 'qr', label: 'Counter Standee QR', icon: QrCode },
    { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-white text-sm truncate">{shop.name}</h1>
              <p className="text-[10px] text-slate-400">Admin Control Panel</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User badge and logout */}
        <div className="pt-4 border-t border-slate-800 mt-6">
          <div className="px-3 py-2 mb-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Logged in as</p>
            <p className="text-xs font-bold text-white truncate">{admin.email}</p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {activeTab === 'dashboard' && (
          <DashboardTab
            orders={orders}
            jobs={jobs}
            admin={admin}
            onVerifyPayment={onVerifyPayment}
            onRetryJob={onRetryJob}
            onCancelJob={onCancelJob}
            onRefresh={onRefreshData}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            admin={admin}
            onVerifyPayment={onVerifyPayment}
          />
        )}

        {activeTab === 'queue' && (
          <QueueTab
            jobs={jobs}
            admin={admin}
            onRetryJob={onRetryJob}
            onCancelJob={onCancelJob}
          />
        )}

        {activeTab === 'printers' && (
          <PrintersTab
            printers={printers}
            onSetDefault={onSetDefaultPrinter}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            pricing={pricing}
            onSavePricing={onSavePricing}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            shop={shop}
            onSaveShop={onSaveShop}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab orders={orders} />
        )}

        {activeTab === 'qr' && (
          <QRGeneratorTab shop={shop} />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab logs={logs} />
        )}
      </main>
    </div>
  );
};
