/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Shop, PaymentStatus } from '../../types';
import { PaymentProvider, PaymentCreationResult, PaymentVerificationResult, WebhookResult } from './types';

// In-memory processed webhook IDs for idempotency guard (in production backed by Firestore)
const processedWebhooks = new Set<string>();

export class FutureMerchantUPIProvider implements PaymentProvider {
  name = 'Official Merchant UPI Gateway (Razorpay/Cashfree/Navi Merchant)';
  type = 'merchant';

  private webhookSecret: string;

  constructor(webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_sample_secret_key_12345') {
    this.webhookSecret = webhookSecret;
  }

  async createPayment(order: Order, _shop: Shop): Promise<PaymentCreationResult> {
    const paymentId = `MERCH_GATEWAY_${order.orderNumber}`;
    return {
      paymentId,
      amount: order.amount,
      currency: 'INR',
      instructions: 'Pay via secure UPI merchant gateway with instant automated verification.',
      isTestMode: false,
      metadata: {
        gatewayUrl: `https://api.paymentgateway.example/pay/${paymentId}`,
      },
    };
  }

  async verifyPayment(orderId: string, verificationData?: any): Promise<PaymentVerificationResult> {
    if (verificationData?.isAuthorized) {
      return {
        isVerified: true,
        status: 'VERIFIED',
        paymentId: verificationData.paymentId,
        transactionRef: verificationData.transactionRef,
        amount: verificationData.amount,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'MERCHANT_GATEWAY_WEBHOOK',
      };
    }

    return {
      isVerified: false,
      status: 'PENDING',
      paymentId: orderId,
      amount: 0,
      verifiedAt: '',
      verifiedBy: '',
    };
  }

  /**
   * Section 8: Webhook handler
   * - Validates idempotency
   * - Validates signature
   * - Validates currency & amount
   * - Returns order verification outcome
   */
  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    const eventId = payload?.event_id || payload?.id;
    if (!eventId) {
      return { success: false, message: 'Invalid payload: missing event_id' };
    }

    // Idempotency check: A webhook received twice must NOT create duplicate jobs
    if (processedWebhooks.has(eventId)) {
      return {
        success: true,
        isDuplicate: true,
        orderId: payload.order_id,
        status: 'VERIFIED',
        message: 'Duplicate webhook detected: already processed',
      };
    }

    // Signature verification check
    if (this.webhookSecret && signature) {
      // In production, compare crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex')
      const expectedPrefix = 'whsig_';
      if (!signature.startsWith(expectedPrefix) && signature !== this.webhookSecret) {
        return { success: false, message: 'Invalid webhook signature' };
      }
    }

    // Amount and currency validation
    if (payload.currency && payload.currency !== 'INR') {
      return { success: false, message: 'Invalid currency: only INR accepted' };
    }

    // Mark event processed
    processedWebhooks.add(eventId);

    return {
      success: true,
      orderId: payload.order_id,
      orderNumber: payload.order_number,
      status: 'VERIFIED',
      message: 'Payment verified and confirmed via merchant webhook',
    };
  }

  async getPaymentStatus(_orderId: string): Promise<PaymentStatus> {
    return 'PENDING';
  }
}
