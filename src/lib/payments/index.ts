/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaymentProvider } from './types';
import { TestPaymentProvider } from './TestPaymentProvider';
import { UPIQRCodeProvider } from './UPIQRCodeProvider';
import { FutureMerchantUPIProvider } from './FutureMerchantUPIProvider';
import { PaymentMode } from '../../types';

export * from './types';
export * from './TestPaymentProvider';
export * from './UPIQRCodeProvider';
export * from './FutureMerchantUPIProvider';

export function getPaymentProvider(mode: PaymentMode | string): PaymentProvider {
  switch (mode) {
    case 'upi_qr':
      return new UPIQRCodeProvider();
    case 'merchant':
      return new FutureMerchantUPIProvider();
    case 'test':
    default:
      return new TestPaymentProvider();
  }
}
