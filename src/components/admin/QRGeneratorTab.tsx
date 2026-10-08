/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Printer, Download, QrCode, Sparkles, MapPin, Phone } from 'lucide-react';
import { Shop } from '../../types';
import { generateQrCodeSvg } from '../../lib/qrHelper';

interface QRGeneratorTabProps {
  shop: Shop;
}

export const QRGeneratorTab: React.FC<QRGeneratorTabProps> = ({ shop }) => {
  const posterRef = useRef<HTMLDivElement>(null);

  // The customer URL to print: points to current origin + /print/{shopId}
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const customerPrintUrl = `${appOrigin}/print/${shop.shopId}`;
  const qrSvgUrl = generateQrCodeSvg(customerPrintUrl, 320);

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Shop Counter QR Standee</h2>
          <p className="text-xs text-gray-500">
            Generate and print the official counter poster for customers to scan and upload documents.
          </p>
        </div>

        <button
          onClick={handlePrintPoster}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Shop Poster</span>
        </button>
      </div>

      {/* Printable Poster Card */}
      <div className="flex justify-center p-4">
        <div
          ref={posterRef}
          className="bg-white border-4 border-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-xl relative"
        >
          {/* Header */}
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              FAST SELF-SERVICE PRINTING
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-3">{shop.name}</h1>
            <p className="text-xs text-gray-500 mt-1">{shop.address}</p>
          </div>

          {/* QR Container */}
          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl inline-block my-2">
            <img
              src={qrSvgUrl}
              alt="Scan to Print QR Code"
              className="w-64 h-64 mx-auto object-contain bg-white p-2 rounded-xl shadow-xs"
            />
          </div>

          {/* Big Action text */}
          <div className="my-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">SCAN TO PRINT</h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
              Scan with your phone camera or any QR scanner to upload PDF / images directly to our printer.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold inline-flex items-center justify-center mb-1">1</span>
              <p className="font-bold text-gray-900 text-[11px]">Upload File</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold inline-flex items-center justify-center mb-1">2</span>
              <p className="font-bold text-gray-900 text-[11px]">Pay UPI</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold inline-flex items-center justify-center mb-1">3</span>
              <p className="font-bold text-gray-900 text-[11px]">Get Prints</p>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-gray-400">
            Direct Link: {customerPrintUrl}
          </div>
        </div>
      </div>
    </div>
  );
};
