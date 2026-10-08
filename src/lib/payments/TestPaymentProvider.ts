/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Shop, PaymentStatus } from '../../types';
import { PaymentProvider, PaymentCreationResult, PaymentVerificationResult, WebhookResult } from './types';

export class TestPaymentProvider implements PaymentProvider {
  name = 'Test Payment Sandbox';
  type = 'test';

  async createPayment(order: Order, _shop: Shop): Promise<PaymentCreationResult> {
    const paymentId = `TEST_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      paymentId,
      amount: order.amount,
      currency: 'INR',
      instructions: 'TEST MODE: No real money is charged. Click Complete Test Payment to test order processing.',
      isTestMode: true,
      upiDeepLink: `upi://pay?pa=test@mockbank&pn=Digital%20Print%20Test&am=${order.amount}&tr=${order.orderNumber}&tn=TEST_ORDER`,
    };
  }

  async verifyPayment(orderId: string, verificationData?: { adminId?: string; reason?: string }): Promise<PaymentVerificationResult> {
    return {
      isVerified: true,
      status: 'VERIFIED',
      paymentId: `TEST_VERIFY_${Date.now()}`,
      transactionRef: `REF_MOCK_${Math.floor(100000 + Math.random() * 900000)}`,
      amount: 0,
      verifiedAt: new Date().toISOString(),
      verifiedBy: verificationData?.adminId || 'test_simulation_runner',
      reason: verificationData?.reason || 'Development Sandbox Test Payment Verified',
    };
  }

  async handleWebhook(payload: any, _signature?: string): Promise<WebhookResult> {
    if (!payload.orderId) {
      return { success: false, message: 'Missing orderId in test payload' };
    }
    return {
      success: true,
      orderId: payload.orderId,
      status: 'VERIFIED',
      message: 'Test webhook handled successfully',
    };
  }

  async getPaymentStatus(_orderId: string): Promise<PaymentStatus> {
    return 'VERIFIED';
  }
}
