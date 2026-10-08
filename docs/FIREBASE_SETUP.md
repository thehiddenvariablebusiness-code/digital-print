# Firebase Configuration & Security Guide

This project is built for **Google Cloud / Firebase Free-First Tier** (Firestore Spark Plan & Enterprise Edition).

---

## 1. Provisioned Credentials

The project is integrated with `firebase-applet-config.json` containing:
- `projectId`
- `appId`
- `apiKey`
- `authDomain`
- `firestoreDatabaseId`
- `storageBucket`

---

## 2. Firestore Collections & Schema

1. `/shops/{shopId}`
   - Stores shop profile, contact info, official UPI ID, max upload limits, and file retention policy.
2. `/pricing/{shopId}`
   - Stores rate cards for A4 B&W (Single/Double), A4 Colour (Single/Double), A3 formats, and specialty services.
3. `/orders/{orderId}`
   - Customer orders, customer name, sanitized phone, specs, amounts, paymentStatus, and printStatus.
4. `/printJobs/{jobId}`
   - Print queue consumed by Windows Print Agent. Only orders with `paymentStatus: 'VERIFIED'` enter this collection as `QUEUED`.
5. `/printers/{printerId}`
   - Registered Windows printer drivers, capabilities (Color, Duplex, A3), default printer flag, and agent heartbeats.
6. `/auditLogs/{logId}`
   - Immutable audit logs recording all manual verifications, cancellations, re-prints, and price updates.

---

## 3. Rules Deployment

Firestore security rules are defined in `/firestore.rules`.
To re-deploy rules at any time, execute the `DeployRules` RPC action.
Customer uploads are strictly validated and private; no customer can read another customer's files.
