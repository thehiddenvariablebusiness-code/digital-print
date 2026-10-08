/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Shop, PricingConfig, PrintJob, Printer, AuditLog, PrintOptions } from '../../types';
import { DEFAULT_SHOP_ID, DEFAULT_SHOP, DEFAULT_PRICING } from '../../config/defaults';

const BASE_URL = '';

export async function fetchShopConfig(shopId: string = DEFAULT_SHOP_ID): Promise<Shop> {
  try {
    const res = await fetch(`${BASE_URL}/api/shop?shopId=${encodeURIComponent(shopId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend unavailable, using default shop config:', e);
  }
  return DEFAULT_SHOP;
}

export async function updateShopConfig(shop: Shop): Promise<Shop> {
  const res = await fetch(`${BASE_URL}/api/shop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shop),
  });
  if (!res.ok) throw new Error('Failed to update shop configuration');
  return await res.json();
}

export async function fetchPricingConfig(shopId: string = DEFAULT_SHOP_ID): Promise<PricingConfig> {
  try {
    const res = await fetch(`${BASE_URL}/api/pricing?shopId=${encodeURIComponent(shopId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend unavailable, using default pricing:', e);
  }
  return DEFAULT_PRICING;
}

export async function updatePricingConfig(pricing: PricingConfig): Promise<PricingConfig> {
  const res = await fetch(`${BASE_URL}/api/pricing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricing),
  });
  if (!res.ok) throw new Error('Failed to update pricing');
  return await res.json();
}

export interface CreateOrderParams {
  shopId: string;
  customerName: string;
  customerPhone: string;
  options: PrintOptions;
  pageCount: number;
  file: File;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('shopId', params.shopId);
  formData.append('customerName', params.customerName);
  formData.append('customerPhone', params.customerPhone);
  formData.append('pageCount', String(params.pageCount));
  formData.append('paperSize', params.options.paperSize);
  formData.append('printType', params.options.printType);
  formData.append('duplex', params.options.duplex);
  formData.append('copies', String(params.options.copies));
  formData.append('orientation', params.options.orientation);

  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Order creation failed' }));
    throw new Error(err.error || 'Failed to create order');
  }

  return await res.json();
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const res = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to load order');
  }
  return await res.json();
}

export async function trackOrderByPhone(orderNumber: string, phone: string): Promise<Order | null> {
  const res = await fetch(`${BASE_URL}/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Order not found or mobile number mismatch');
  }
  return await res.json();
}

export async function claimPayment(orderId: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/claim-payment`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to submit payment claim');
  return await res.json();
}

export async function verifyPayment(
  orderId: string,
  adminId: string,
  adminEmail: string,
  reason: string
): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminEmail, reason }),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return await res.json();
}

export async function fetchAllOrders(shopId: string = DEFAULT_SHOP_ID): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/api/orders?shopId=${encodeURIComponent(shopId)}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

export async function fetchPrintJobs(shopId: string = DEFAULT_SHOP_ID): Promise<PrintJob[]> {
  const res = await fetch(`${BASE_URL}/api/print-jobs?shopId=${encodeURIComponent(shopId)}`);
  if (!res.ok) throw new Error('Failed to fetch print jobs');
  return await res.json();
}

export async function retryPrintJob(jobId: string, adminId: string): Promise<PrintJob> {
  const res = await fetch(`${BASE_URL}/api/print-jobs/${encodeURIComponent(jobId)}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId }),
  });
  if (!res.ok) throw new Error('Failed to retry print job');
  return await res.json();
}

export async function cancelPrintJob(jobId: string, adminId: string, reason: string): Promise<PrintJob> {
  const res = await fetch(`${BASE_URL}/api/print-jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, reason }),
  });
  if (!res.ok) throw new Error('Failed to cancel print job');
  return await res.json();
}

export async function fetchPrinters(shopId: string = DEFAULT_SHOP_ID): Promise<Printer[]> {
  const res = await fetch(`${BASE_URL}/api/printers?shopId=${encodeURIComponent(shopId)}`);
  if (!res.ok) throw new Error('Failed to fetch printers');
  return await res.json();
}

export async function setDefaultPrinter(printerId: string, shopId: string = DEFAULT_SHOP_ID): Promise<Printer[]> {
  const res = await fetch(`${BASE_URL}/api/printers/${encodeURIComponent(printerId)}/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopId }),
  });
  if (!res.ok) throw new Error('Failed to update default printer');
  return await res.json();
}

export async function fetchAuditLogs(shopId: string = DEFAULT_SHOP_ID): Promise<AuditLog[]> {
  const res = await fetch(`${BASE_URL}/api/audit-logs?shopId=${encodeURIComponent(shopId)}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return await res.json();
}
