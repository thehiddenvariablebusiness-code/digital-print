/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaperSize = 'A4' | 'A3';
export type PrintType = 'BW' | 'COLOR';
export type DuplexMode = 'SINGLE' | 'DOUBLE';
export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export type PaymentStatus = 
  | 'PENDING' 
  | 'CLAIMED' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'EXPIRED' 
  | 'REFUNDED';

export type PrintStatus = 
  | 'WAITING_FOR_PAYMENT' 
  | 'QUEUED' 
  | 'CLAIMED'
  | 'DOWNLOADING' 
  | 'PRINTING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export type PaymentMode = 'test' | 'upi_qr' | 'merchant';

export interface Shop {
  shopId: string;
  name: string;
  phone: string;
  address: string;
  upiId: string;
  qrImageUrl?: string;
  maxFileSizeMb: number;
  fileRetentionHours: number;
  paymentMode: PaymentMode;
  createdAt: string;
  updatedAt: string;
}

export interface PricingConfig {
  shopId: string;
  a4BwSingle: number;
  a4BwDouble: number;
  a4ColorSingle: number;
  a4ColorDouble: number;
  a3BwSingle: number;
  a3BwDouble: number;
  a3ColorSingle: number;
  a3ColorDouble: number;
  photoPrint?: number;
  idPhoto?: number;
  resumePrint?: number;
  scanPerPage?: number;
  updatedAt: string;
}

export interface PrintOptions {
  paperSize: PaperSize;
  printType: PrintType;
  duplex: DuplexMode;
  copies: number;
  orientation: Orientation;
}

export interface PriceBreakdown {
  pageCount: number;
  effectiveSheets: number;
  ratePerSheet: number;
  subtotalPerPageGroup: number;
  copies: number;
  total: number;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  pageCount: number;
  paperSize: PaperSize;
  printType: PrintType;
  duplex: DuplexMode;
  copies: number;
  orientation: Orientation;
  unitPrice: number;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentClaimedAt?: string;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  verificationReason?: string;
  printStatus: PrintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PrintJob {
  jobId: string;
  orderId: string;
  orderNumber: string;
  shopId: string;
  status: PrintStatus;
  printerId?: string;
  windowsPrinterName?: string;
  claimedByAgentId?: string;
  claimedAt?: string;
  downloadUrl?: string;
  fileName: string;
  pageCount: number;
  paperSize: PaperSize;
  printType: PrintType;
  duplex: DuplexMode;
  copies: number;
  orientation: Orientation;
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Printer {
  printerId: string;
  shopId: string;
  name: string;
  windowsPrinterName: string;
  status: 'ONLINE' | 'OFFLINE' | 'PRINTING' | 'ERROR';
  isDefault: boolean;
  supportsColor: boolean;
  supportsA3: boolean;
  supportsDuplex: boolean;
  lastHeartbeat: string;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  shopId: string;
  adminId: string;
  adminEmail: string;
  action: string;
  orderId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'staff';
}
