/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Shop, PaymentStatus } from '../../types';

export interface PaymentCreationResult {
  paymentId: string;
  qrPayload?: string;
  upiDeepLink?: string;
  amount: number;
  currency: string;
  instructions: string;
  isTestMode: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  status: PaymentStatus;
  paymentId: string;
  transactionRef?: string;
  amount: number;
  verifiedAt: string;
  verifiedBy: string;
  reason?: string;
}

export interface WebhookResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  status?: PaymentStatus;
  message: string;
  isDuplicate?: boolean;
}

export interface PaymentProvider {
  name: string;
  type: string;
  createPayment(order: Order, shop: Shop): Promise<PaymentCreationResult>;
  verifyPayment(orderId: string, verificationData?: any): Promise<PaymentVerificationResult>;
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;
}
