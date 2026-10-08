# Anti-Fraud & Security Architecture

## 1. Zero-Trust Principles

Digital Print is engineered under strict anti-fraud guarantees:

1. **Server-Side Price Calculation**:
   - The browser never computes the authoritative order price.
   - Even if an attacker modifies the network payload sent to `/api/orders`, the server intercepts the request and recalculates the exact amount using the live rate card in the database.

2. **Never Trust Customer Payment Claims**:
   - Tapping &quot;I HAVE PAID&quot; ONLY sets the order to `CLAIMED`.
   - The database status can only transition to `VERIFIED` via authenticated shop admin review or cryptographic webhook signature validation.

3. **Atomic Queue Claiming (Duplicate Print Prevention)**:
   - When the Windows Print Agent polls a `QUEUED` job, it performs an atomic claim transition (`QUEUED` -> `CLAIMED`).
   - If multiple counter PCs run the agent simultaneously, only one agent can acquire the lock. Subsequent claim attempts receive a `409 Conflict`.

4. **Private Storage & Time-Limited Access**:
   - Customer PDF/image files are stored with randomly generated file hashes.
   - Files are not publicly exposed and can only be accessed by the shop agent or authenticated admin.
   - Configurable file retention policy automatically purges documents after the retention window (default 24 hours).

5. **Immutable Audit Trail**:
   - All manual verifications, price changes, job cancellations, and reprint requests record an immutable entry in the `auditLogs` collection with Admin ID, timestamp, and justification.
