# Digital Print Shop — Complete Setup & Architecture Guide

Welcome to **Digital Print**, an automated QR → Upload → Price → UPI Payment → Automatic Printing system built for xerox and local print shops with a **free-first** architecture.

---

## 1. System Overview

```
[Customer Phone]
      │
      ▼  Scans counter standee QR code
[/print/{shopId}]
      │
      ▼  Uploads PDF / JPG / PNG (auto-detects page count via pdf-lib)
[Print Settings]
      │
      ▼  Selects Paper (A4/A3), Mode (B&W/Color), Duplex (Single/Double), Copies
[Price Calculation]
      │
      ▼  Server-side calculated from Firestore pricing rules
[UPI Payment]
      │
      ▼  Displays dynamic UPI Intent & QR Code (Navi / GPay / PhonePe / BHIM)
[Payment Confirmation]
      │
      ├──> Test Mode: Instant Developer Sandbox simulation
      ├──> UPI QR Mode: Customer marks "I HAVE PAID" (CLAIMED) -> Admin approves (VERIFIED)
      └──> Merchant Webhook: Idempotent banking webhook automatically sets VERIFIED
      │
      ▼
[Print Queue in Firestore (QUEUED)]
      │
      ▼  Polled & locked atomically by shop Windows computer
[Windows Print Agent]
      │
      ├──> Claims job atomically (QUEUED -> CLAIMED)
      ├──> Downloads document via private token URL
      ├──> Spools directly to physical Windows printer (A4/A3, Duplex, Color)
      └──> Updates status to PRINTING -> COMPLETED
      │
      ▼
[Customer Collects Prints at Counter]
```

---

## 2. Directory Structure

- `/src`
  - `/components`: Mobile-first responsive UI (Upload, Print options, Price breakdown, UPI Modal, Order tracking, Admin portal)
  - `/lib`:
    - `firebase`: Firebase initialization, security rules, and error handling
    - `payments`: `PaymentProvider` abstraction (`TestPaymentProvider`, `UPIQRCodeProvider`, `FutureMerchantUPIProvider`)
    - `pricing`: Server-side price calculator engine
    - `services`: API and store synchronization client
- `/server.ts`: Full-stack Express backend with Vite middleware
- `/print-agent`: Independent Windows service daemon with Windows print spooler and simulation runner
- `/firebase-blueprint.json`: Standard Firebase blueprint intermediate representation
- `/firestore.rules`: Hardened zero-trust security rules with action gates
- `/storage.rules`: Private bucket rules preventing public scraping of customer documents
- `/docs`: Setup, payment, print agent, and security manuals

---

## 3. Quick Start (Development)

1. Start full-stack web app:
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`.

2. Start the Windows Print Agent (in simulation mode):
   ```bash
   cd print-agent
   npm run test-simulation
   ```

3. Open `http://localhost:3000/` in browser or mobile:
   - Upload any PDF or image.
   - Configure options and press **CONTINUE TO PAYMENT**.
   - Test payment in sandbox mode or scan UPI.
   - Watch the print agent daemon instantly claim and complete the job!
