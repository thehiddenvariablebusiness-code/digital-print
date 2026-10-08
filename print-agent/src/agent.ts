/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { discoverWindowsPrinters } from './printerDiscovery.js';
import { spoolPrintJob } from './printerSpooler.js';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const SHOP_ID = process.env.SHOP_ID || 'shop_digital_print_01';
const SHOP_API_KEY = process.env.SHOP_API_KEY || 'agent_secret_key_change_in_production';
const AGENT_ID = process.env.AGENT_ID || `win-print-agent-${os.hostname().toLowerCase()}`;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '3000', 10);
const PRINT_MODE = process.env.PRINT_MODE || 'simulation';

const TEMP_DOWNLOAD_DIR = path.join(process.cwd(), 'temp_jobs');
if (!fs.existsSync(TEMP_DOWNLOAD_DIR)) {
  fs.mkdirSync(TEMP_DOWNLOAD_DIR, { recursive: true });
}

console.log('========================================================');
console.log(' DIGITAL PRINT - WINDOWS PRINT AGENT DAEMON');
console.log('========================================================');
console.log(`Agent ID:        ${AGENT_ID}`);
console.log(`Target Shop:     ${SHOP_ID}`);
console.log(`Backend Server:  ${BACKEND_URL}`);
console.log(`Print Mode:      ${PRINT_MODE.toUpperCase()}`);
console.log(`Poll Frequency:  Every ${POLL_INTERVAL_MS / 1000}s`);
console.log('========================================================\n');

async function syncPrintersWithBackend() {
  try {
    const printers = await discoverWindowsPrinters();
    console.log(`[PRINTERS] Discovered ${printers.length} local printer(s):`, printers.map((p) => p.name).join(', '));

    const res = await fetch(`${BACKEND_URL}/api/agent/printers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Key': SHOP_API_KEY,
      },
      body: JSON.stringify({
        shopId: SHOP_ID,
        printers,
      }),
    });

    if (res.ok) {
      console.log(`[PRINTERS] Successfully registered printers with backend.`);
    } else {
      console.warn(`[PRINTERS] Backend rejected printer sync: status ${res.status}`);
    }
  } catch (err: any) {
    console.error(`[PRINTERS ERROR] Could not sync printers: ${err.message}`);
  }
}

async function claimJob(jobId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agent/jobs/${jobId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Key': SHOP_API_KEY,
      },
      body: JSON.stringify({ agentId: AGENT_ID }),
    });

    if (res.status === 409) {
      console.log(`[QUEUE] Job ${jobId} was already claimed by another agent.`);
      return null;
    }

    if (!res.ok) {
      console.error(`[QUEUE] Failed to claim job ${jobId}: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[QUEUE ERROR] Claiming failed: ${err.message}`);
    return null;
  }
}

async function updateJobStatus(jobId: string, status: string, errorMessage?: string) {
  try {
    await fetch(`${BACKEND_URL}/api/agent/jobs/${jobId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Key': SHOP_API_KEY,
      },
      body: JSON.stringify({
        status,
        errorMessage,
      }),
    });
  } catch (err: any) {
    console.error(`[STATUS ERROR] Could not update job status: ${err.message}`);
  }
}

async function downloadJobFile(downloadUrl: string, fileName: string): Promise<string> {
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${BACKEND_URL}${downloadUrl}`;
  const res = await fetch(fullUrl, {
    headers: { 'X-Shop-Key': SHOP_API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Failed to download document from backend (${res.status})`);
  }

  const buffer = await res.arrayBuffer();
  const localFilePath = path.join(TEMP_DOWNLOAD_DIR, `${Date.now()}_${fileName}`);
  fs.writeFileSync(localFilePath, Buffer.from(buffer));
  return localFilePath;
}

async function processQueueOnce() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agent/jobs?shopId=${SHOP_ID}`, {
      headers: { 'X-Shop-Key': SHOP_API_KEY },
    });

    if (!res.ok) {
      return;
    }

    const queuedJobs = await res.json();
    if (!Array.isArray(queuedJobs) || queuedJobs.length === 0) {
      return;
    }

    console.log(`[QUEUE] Found ${queuedJobs.length} QUEUED print job(s). Processing oldest...`);

    for (const rawJob of queuedJobs) {
      // Step 1: Atomic Claim Lock
      const claimed = await claimJob(rawJob.jobId);
      if (!claimed) continue;

      console.log(`\n========================================`);
      console.log(`>>> PROCESSING ORDER: ${claimed.orderNumber}`);
      console.log(`========================================`);

      let localFilePath = '';

      try {
        // Step 2: Download Document
        console.log(`[DOWNLOAD] Fetching "${claimed.fileName}"...`);
        localFilePath = await downloadJobFile(claimed.downloadUrl, claimed.fileName);

        // Step 3: Update to PRINTING
        await updateJobStatus(claimed.jobId, 'PRINTING');

        // Step 4: Spool to physical / simulated printer
        const spoolResult = await spoolPrintJob({
          jobId: claimed.jobId,
          orderNumber: claimed.orderNumber,
          printerName: claimed.windowsPrinterName || 'Default Windows Spooler',
          filePath: localFilePath,
          paperSize: claimed.paperSize,
          printType: claimed.printType,
          duplex: claimed.duplex,
          copies: claimed.copies,
          orientation: claimed.orientation,
        });

        if (spoolResult.success) {
          console.log(`[COMPLETED] Order ${claimed.orderNumber} printed successfully!`);
          await updateJobStatus(claimed.jobId, 'COMPLETED');
        } else {
          throw new Error(spoolResult.error || 'Spooling failed');
        }
      } catch (err: any) {
        console.error(`[FAILED] Error processing order ${claimed.orderNumber}: ${err.message}`);
        await updateJobStatus(claimed.jobId, 'FAILED', err.message);
      } finally {
        // Clean up temporary downloaded file
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (_) {}
        }
      }
    }
  } catch (err: any) {
    // Backend may be momentarily starting up or network blip
  }
}

async function main() {
  // Initial printer discovery and registration
  await syncPrintersWithBackend();

  // Heartbeat printer sync every 5 minutes
  setInterval(syncPrintersWithBackend, 5 * 60 * 1000);

  // Poll print queue loop
  console.log(`[DAEMON] Listening for verified print jobs...`);
  setInterval(processQueueOnce, POLL_INTERVAL_MS);
}

main();
