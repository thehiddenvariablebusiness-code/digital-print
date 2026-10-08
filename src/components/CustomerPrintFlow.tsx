/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { Shop, PricingConfig, PrintOptions, Order } from '../types';
import { calculatePrice } from '../lib/pricing/calculator';
import { createOrder } from '../lib/services/apiService';

interface CustomerPrintFlowProps {
  shop: Shop;
  pricing: PricingConfig;
  onOrderCreated: (order: Order) => void;
}

export const CustomerPrintFlow: React.FC<CustomerPrintFlowProps> = ({
  shop,
  pricing,
  onOrderCreated,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [options, setOptions] = useState<PrintOptions>({
    paperSize: 'A4',
    printType: 'BW',
    duplex: 'SINGLE',
    copies: 1,
    orientation: 'PORTRAIT',
  });

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate price breakdown
  const priceBreakdown = calculatePrice(pageCount, options, pricing);

  // Handle file selection and determine page count
  const handleFileSelection = async (selectedFile: File) => {
    setErrorMsg('');

    // 1. Validate file extension and MIME
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg('Invalid file type. Only PDF, JPG, JPEG, and PNG files are accepted.');
      return;
    }

    // 2. Validate file size (max shop.maxFileSizeMb)
    const maxSizeBytes = (shop.maxFileSizeMb || 50) * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setErrorMsg(`File too large. Maximum allowed size is ${shop.maxFileSizeMb}MB.`);
      return;
    }

    setFile(selectedFile);
    setIsReadingFile(true);

    try {
      if (ext === '.pdf') {
        // Parse PDF to determine exact page count using pdf-lib
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        setPageCount(Math.max(1, count));
      } else {
        // Image files default to 1 printable page
        setPageCount(1);
      }
    } catch (err: any) {
      console.warn('Could not read PDF metadata in browser, default to 1 page:', err);
      setPageCount(1);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // Submit order to backend
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg('Please upload a document to proceed.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    // Validate Indian 10-digit mobile number
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        shopId: shop.shopId,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        options,
        pageCount,
        file,
      });

      onOrderCreated(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Direct Shop Counter Printing</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Print Your Documents
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl mx-auto">
          Upload your PDF or image, choose print settings, pay securely via UPI, and pick up your prints at the counter.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-8">
        {/* STEP 1: Upload Box */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Upload Document</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">Max {shop.maxFileSizeMb}MB • PDF, JPG, PNG</span>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileSelection(e.target.files[0])}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-gray-900 text-base max-w-sm truncate">{file.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {isReadingFile ? 'Counting pages...' : `${pageCount} page(s) detected`}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Change Document
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="font-semibold text-gray-800 text-base">Click or drag file here to upload</p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF notes, project reports, ID scans, photos</p>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: Print Settings */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Print Options</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">Configure format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Paper Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Paper Size</label>
              <div className="grid grid-cols-2 gap-2">
                {(['A4', 'A3'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setOptions({ ...options, paperSize: size })}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                      options.paperSize === size
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{size}</span>
                    <span className="text-xs opacity-80">{size === 'A4' ? 'Standard' : 'Large'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Color Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'BW', label: 'Black & White', desc: `₹${options.paperSize === 'A4' ? pricing.a4BwSingle : pricing.a3BwSingle}/pg` },
                  { id: 'COLOR', label: 'Full Colour', desc: `₹${options.paperSize === 'A4' ? pricing.a4ColorSingle : pricing.a3ColorSingle}/pg` },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setOptions({ ...options, printType: mode.id as any })}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition ${
                      options.printType === mode.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{mode.label}</span>
                    <span className="text-[11px] opacity-80">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duplex / Sides */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Printing Sides</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SINGLE', label: 'Single Side', desc: '1 side per sheet' },
                  { id: 'DOUBLE', label: 'Double Side (Duplex)', desc: 'Both sides (save paper)' },
                ].map((side) => (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => setOptions({ ...options, duplex: side.id as any })}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition ${
                      options.duplex === side.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{side.label}</span>
                    <span className="text-[10px] opacity-80">{side.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Number of Copies</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, copies: Math.max(1, options.copies - 1) })}
                  className="w-11 h-11 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 text-lg flex items-center justify-center"
                >
                  -
                </button>
                <div className="flex-1 text-center py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 text-base">
                  {options.copies} {options.copies === 1 ? 'Copy' : 'Copies'}
                </div>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, copies: options.copies + 1 })}
                  className="w-11 h-11 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: Price Calculation Summary */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3 mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold">3</span>
              <span>Automatic Price Calculation</span>
            </h3>
            <span className="text-xs text-indigo-300 font-medium">Live Shop Rate Card</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-indigo-200 block text-[11px]">Pages in Document</span>
              <span className="text-base font-bold text-white">{pageCount}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-indigo-200 block text-[11px]">Paper & Mode</span>
              <span className="text-base font-bold text-white">{options.paperSize} • {options.printType === 'BW' ? 'B&W' : 'Colour'}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-indigo-200 block text-[11px]">Sides & Rate</span>
              <span className="text-base font-bold text-white">{options.duplex === 'SINGLE' ? 'Single' : 'Double'} (₹{priceBreakdown.ratePerSheet})</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <span className="text-indigo-200 block text-[11px]">Quantity</span>
              <span className="text-base font-bold text-white">{options.copies} set(s)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-indigo-800/60">
            <div>
              <span className="text-xs text-indigo-200 block">Total Amount to Pay</span>
              <span className="text-xs text-slate-400">Inclusive of paper & printing charges</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-400">₹{priceBreakdown.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* STEP 4: Customer Details & Checkout */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Customer Information</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">For order identification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Indian Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-gray-500">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm tracking-wider"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">Used to verify pickup and track print progress</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className={`w-full py-4 rounded-xl text-base font-extrabold flex items-center justify-center gap-2 transition shadow-md ${
                isSubmitting || !file
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <span>Generating Order & Payment QR...</span>
              ) : (
                <>
                  <span>CONTINUE TO PAYMENT (₹{priceBreakdown.total.toFixed(2)})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2.5">
              Secure payment via UPI (GPay, PhonePe, Navi, Paytm, BHIM)
            </p>
          </div>
        </section>
      </form>
    </div>
  );
};
