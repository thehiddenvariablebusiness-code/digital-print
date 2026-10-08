/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Shop, PaymentStatus } from '../../types';
import { PaymentProvider, PaymentCreationResult, PaymentVerificationResult, WebhookResult } from './types';

export class UPIQRCodeProvider implements PaymentProvider {
  name = 'UPI / Navi QR Payment';
  type = 'upi_qr';

  async createPayment(order: Order, shop: Shop): Promise<PaymentCreationResult> {
    const upiId = shop.upiId || 'digitalprint@navi';
    const shopName = encodeURIComponent(shop.name || 'Digital Print');
    const orderNote = encodeURIComponent(`Print Order ${order.orderNumber}`);
    
    // Standard National Payments Corporation of India (NPCI) UPI Intent URI spec
    const upiDeepLink = `upi://pay?pa=${upiId}&pn=${shopName}&am=${order.amount.toFixed(2)}&cu=INR&tn=${orderNote}&tr=${order.orderNumber}`;

    return {
      paymentId: `UPI_REQ_${order.orderNumber}`,
      qrPayload: upiDeepLink,
      upiDeepLink,
      amount: order.amount,
      currency: 'INR',
      instructions: 'Scan with any UPI app (Google Pay, PhonePe, Navi, Paytm, BHIM) and pay the exact amount.',
      isTestMode: false,
      metadata: {
        upiId,
        shopName: shop.name,
        orderNumber: order.orderNumber,
        staticQrImage: shop.qrImageUrl || null,
      },
    };
  }

  async verifyPayment(_orderId: string, verificationData?: { adminId: string; reason: string; transactionId?: string }): Promise<PaymentVerificationResult> {
    // Only verified when admin explicitly confirms or automated banking webhook validates
    if (!verificationData?.adminId) {
      return {
        isVerified: false,
        status: 'CLAIMED',
        paymentId: `UPI_UNVERIFIED_${Date.now()}`,
        amount: 0,
        verifiedAt: '',
        verifiedBy: '',
        reason: 'Awaiting shop owner bank/SMS verification',
      };
    }

    return {
      isVerified: true,
      status: 'VERIFIED',
      paymentId: verificationData.transactionId || `MANUAL_UPI_${Date.now()}`,
      amount: 0,
      verifiedAt: new Date().toISOString(),
      verifiedBy: verificationData.adminId,
      reason: verificationData.reason || 'Admin verified UPI payment received on shop device',
    };
  }

  async handleWebhook(_payload: any, _signature?: string): Promise<WebhookResult> {
    return {
      success: false,
      message: 'Static UPI QR does not support direct incoming webhooks without a registered payment aggregator.',
    };
  }

  async getPaymentStatus(_orderId: string): Promise<PaymentStatus> {
    return 'PENDING';
  }
}
