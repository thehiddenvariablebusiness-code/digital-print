# Payment Architecture & Navi UPI Integration Guide

## 1. Important Payment Rule

> **CRITICAL**: A static UPI / Navi QR does **NOT** automatically prove payment.
> Under no circumstances does the customer tapping &quot;I HAVE PAID&quot; set the order to `PAID` or `VERIFIED`.

Automatic confirmation cannot be claimed from a static QR without merchant bank API integration.
Therefore, Digital Print adheres to this strict security state machine:

```
[Customer Taps "I HAVE PAID"]
              │
              ▼
    status: CLAIMED
              │
    (Awaiting counter verification)
              │
   ┌──────────┴──────────┐
   ▼                     ▼
[Admin Verifies via SMS]  [Official Webhook Event]
   │                     │
   └──────────┬──────────┘
              ▼
      status: VERIFIED
              │
              ▼
  Dispatched to Print Queue
```

---

## 2. Payment Modes

The shop owner can configure the active payment provider in **Admin → Shop Settings**:

1. **Test Sandbox (`test`)**:
   - Generates simulated payment transactions.
   - Includes a 1-click **Complete Test Payment** button for development.
   - Prominently displays: `"TEST MODE — NO REAL PAYMENT"`.

2. **UPI / Navi QR (`upi_qr`)**:
   - Displays dynamic NPCI UPI string (`upi://pay?pa=...&am=...&tr=...`).
   - Supports Navi, Google Pay, PhonePe, Paytm, BHIM.
   - When customer taps &quot;I HAVE PAID&quot;, marks status as `CLAIMED`.
   - The shop owner checks their UPI soundbox/SMS and taps **Verify Pay** on the admin dashboard with an audit reason.

3. **Official Merchant Webhook (`merchant`)**:
   - For merchants with a payment aggregator account (e.g. Razorpay UPI Gateway, Cashfree, PhonePe Business API).
   - Listens on `/api/payment/webhook`.
   - Verifies HMAC signature, validates currency (INR), validates exact amount against database order record, enforces idempotency, and automatically marks `VERIFIED`.
