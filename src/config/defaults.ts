/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shop, PricingConfig } from '../types';

export const DEFAULT_SHOP_ID = 'shop_digital_print_01';

export const DEFAULT_SHOP: Shop = {
  shopId: DEFAULT_SHOP_ID,
  name: 'Digital Print',
  phone: '+91 98765 43210',
  address: 'Shop No. 4, College Road Market, Near Metro Gate 2',
  upiId: 'digitalprint@navi',
  qrImageUrl: '',
  maxFileSizeMb: 50,
  fileRetentionHours: 24,
  paymentMode: 'test', // 'test' in dev, configurable to 'upi_qr' or 'merchant'
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_PRICING: PricingConfig = {
  shopId: DEFAULT_SHOP_ID,
  a4BwSingle: 2,       // ₹2/page
  a4BwDouble: 3,       // ₹3 for double-sided sheet
  a4ColorSingle: 10,   // ₹10/page
  a4ColorDouble: 18,   // ₹18 for double-sided sheet
  a3BwSingle: 5,       // ₹5/page
  a3BwDouble: 8,       // ₹8 for double-sided sheet
  a3ColorSingle: 20,   // ₹20/page
  a3ColorDouble: 35,   // ₹35 for double-sided sheet
  photoPrint: 30,
  idPhoto: 50,
  resumePrint: 5,
  scanPerPage: 5,
  updatedAt: new Date().toISOString(),
};
