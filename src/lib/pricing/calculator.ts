/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PricingConfig, PrintOptions, PriceBreakdown } from '../../types';

export function calculatePrice(
  pageCount: number,
  options: PrintOptions,
  pricing: PricingConfig
): PriceBreakdown {
  const pages = Math.max(1, pageCount);
  const copies = Math.max(1, options.copies || 1);

  let singleRate = 2;
  let doubleRate = 3;

  if (options.paperSize === 'A4') {
    if (options.printType === 'BW') {
      singleRate = pricing.a4BwSingle;
      doubleRate = pricing.a4BwDouble;
    } else {
      singleRate = pricing.a4ColorSingle;
      doubleRate = pricing.a4ColorDouble;
    }
  } else if (options.paperSize === 'A3') {
    if (options.printType === 'BW') {
      singleRate = pricing.a3BwSingle;
      doubleRate = pricing.a3BwDouble;
    } else {
      singleRate = pricing.a3ColorSingle;
      doubleRate = pricing.a3ColorDouble;
    }
  }

  let subtotalPerPageGroup = 0;
  let effectiveSheets = 0;
  let ratePerSheet = singleRate;

  if (options.duplex === 'SINGLE') {
    effectiveSheets = pages;
    subtotalPerPageGroup = pages * singleRate;
    ratePerSheet = singleRate;
  } else {
    // Double-sided calculation
    const fullSheets = Math.floor(pages / 2);
    const oddPage = pages % 2;
    effectiveSheets = fullSheets + oddPage;
    subtotalPerPageGroup = (fullSheets * doubleRate) + (oddPage * singleRate);
    ratePerSheet = doubleRate;
  }

  const total = Math.round(subtotalPerPageGroup * copies * 100) / 100;

  return {
    pageCount: pages,
    effectiveSheets,
    ratePerSheet,
    subtotalPerPageGroup,
    copies,
    total,
  };
}
