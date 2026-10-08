/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomerPrintFlow } from './components/CustomerPrintFlow';
import { PaymentModal } from './components/PaymentModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { SetupNotice } from './components/SetupNotice';
import { DEFAULT_SHOP, DEFAULT_PRICING, DEFAULT_SHOP_ID } from './config/defaults';
import { Shop, PricingConfig, Order, PrintJob, Printer, AuditLog, AdminUser } from './types';
import {
  fetchShopConfig,
  updateShopConfig,
  fetchPricingConfig,
  updatePricingConfig,
  fetchAllOrders,
  fetchPrintJobs,
  fetchPrinters,
  fetchAuditLogs,
  verifyPayment as apiVerifyPayment,
  retryPrintJob as apiRetryPrintJob,
  cancelPrintJob as apiCancelPrintJob,
  setDefaultPrinter as apiSetDefaultPrinter,
} from './lib/services/apiService';

export default function App() {
  const [shop, setShop] = useState<Shop>(DEFAULT_SHOP);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [activeView, setActiveView] = useState<'print' | 'track' | 'admin'>('print');
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<Order | null>(null);
  const [activeOrderForTracking, setActiveOrderForTracking] = useState<Order | null>(null);

  // Admin session state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('digital_print_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin data streams
  const [orders, setOrders] = useState<Order[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      const [shopData, pricingData] = await Promise.all([
        fetchShopConfig(DEFAULT_SHOP_ID),
        fetchPricingConfig(DEFAULT_SHOP_ID),
      ]);
      setShop(shopData);
      setPricing(pricingData);
    } catch (err) {
      console.warn('Using default configurations:', err);
    }
  }, []);

  // Poll data for admin and live state
  const refreshLiveStream = useCallback(async () => {
    try {
      const [orderList, jobList, printerList, logList] = await Promise.all([
        fetchAllOrders(DEFAULT_SHOP_ID),
        fetchPrintJobs(DEFAULT_SHOP_ID),
        fetchPrinters(DEFAULT_SHOP_ID),
        fetchAuditLogs(DEFAULT_SHOP_ID),
      ]);
      setOrders(orderList);
      setJobs(jobList);
      setPrinters(printerList);
      setAuditLogs(logList);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadInitialData();
    refreshLiveStream();

    const interval = setInterval(refreshLiveStream, 3500);
    return () => clearInterval(interval);
  }, [loadInitialData, refreshLiveStream]);

  // URL routing on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setActiveView('admin');
    } else if (path.startsWith('/track')) {
      setActiveView('track');
    }
  }, []);

  // Admin actions
  const handleAdminLogin = (user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem('digital_print_admin_session', JSON.stringify(user));
    } catch (_) {}
    refreshLiveStream();
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('digital_print_admin_session');
    } catch (_) {}
  };

  const handleVerifyPayment = async (order: Order, reason: string) => {
    if (!adminUser) return;
    try {
      await apiVerifyPayment(order.orderId, adminUser.uid, adminUser.email, reason);
      refreshLiveStream();
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    }
  };

  const handleRetryJob = async (job: PrintJob) => {
    if (!adminUser) return;
    try {
      await apiRetryPrintJob(job.jobId, adminUser.uid);
      refreshLiveStream();
    } catch (err: any) {
      alert('Retry failed: ' + err.message);
    }
  };

  const handleCancelJob = async (job: PrintJob, reason: string) => {
    if (!adminUser) return;
    try {
      await apiCancelPrintJob(job.jobId, adminUser.uid, reason);
      refreshLiveStream();
    } catch (err: any) {
      alert('Cancel failed: ' + err.message);
    }
  };

  const handleSavePricing = async (updatedPricing: PricingConfig) => {
    const saved = await updatePricingConfig(updatedPricing);
    setPricing(saved);
  };

  const handleSaveShop = async (updatedShop: Shop) => {
    const saved = await updateShopConfig(updatedShop);
    setShop(saved);
  };

  const handleSetDefaultPrinter = async (printerId: string) => {
    const updatedPrinters = await apiSetDefaultPrinter(printerId, shop.shopId);
    setPrinters(updatedPrinters);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-indigo-500 selection:text-white">
      {/* Configuration & Setup Guide Banner */}
      <SetupNotice shop={shop} />

      {/* Top Navbar */}
      <Navbar
        shop={shop}
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.history.pushState({}, '', view === 'print' ? '/' : `/${view}`);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'print' && (
          <CustomerPrintFlow
            shop={shop}
            pricing={pricing}
            onOrderCreated={(order) => {
              setActiveOrderForPayment(order);
            }}
          />
        )}

        {activeView === 'track' && (
          <OrderTrackingView
            initialOrder={activeOrderForTracking}
            onSelectOrderToPay={(order) => setActiveOrderForPayment(order)}
          />
        )}

        {activeView === 'admin' && (
          adminUser ? (
            <AdminLayout
              admin={adminUser}
              shop={shop}
              pricing={pricing}
              orders={orders}
              jobs={jobs}
              printers={printers}
              logs={auditLogs}
              onLogout={handleAdminLogout}
              onVerifyPayment={handleVerifyPayment}
              onRetryJob={handleRetryJob}
              onCancelJob={handleCancelJob}
              onSavePricing={handleSavePricing}
              onSaveShop={handleSaveShop}
              onSetDefaultPrinter={handleSetDefaultPrinter}
              onRefreshData={refreshLiveStream}
            />
          ) : (
            <AdminLogin onLoginSuccess={handleAdminLogin} />
          )
        )}
      </main>

      {/* UPI Payment Modal */}
      {activeOrderForPayment && (
        <PaymentModal
          order={activeOrderForPayment}
          shop={shop}
          onClose={() => setActiveOrderForPayment(null)}
          onPaymentVerified={(order) => {
            setActiveOrderForTracking(order);
            refreshLiveStream();
          }}
          onTrackOrder={(order) => {
            setActiveOrderForPayment(null);
            setActiveOrderForTracking(order);
            setActiveView('track');
          }}
        />
      )}

      {/* Footer (only on customer-facing views) */}
      {activeView !== 'admin' && <Footer shop={shop} />}
    </div>
  );
}
