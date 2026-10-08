/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface PrintJobOptions {
  jobId: string;
  orderNumber: string;
  printerName: string;
  filePath: string;
  paperSize: 'A4' | 'A3';
  printType: 'BW' | 'COLOR';
  duplex: 'SINGLE' | 'DOUBLE';
  copies: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
}

export async function spoolPrintJob(options: PrintJobOptions): Promise<{ success: boolean; error?: string }> {
  const isSimulation = process.env.PRINT_MODE === 'simulation' || process.platform !== 'win32';

  console.log(`[SPOOLER] Preparing job ${options.orderNumber} for printer "${options.printerName}"...`);
  console.log(`[SPOOLER] Settings: ${options.paperSize} | ${options.printType} | ${options.duplex} | Copies: ${options.copies} | ${options.orientation}`);

  if (isSimulation) {
    console.log(`[SIMULATION] Simulating Windows Spooler print queue execution...`);
    // Simulate real printer delay: 1.5s per copy
    await new Promise((resolve) => setTimeout(resolve, 1500 * Math.min(3, options.copies)));
    console.log(`[SIMULATION] Job ${options.orderNumber} successfully spooled to simulated printer.`);
    return { success: true };
  }

  try {
    // Windows Real Printing:
    // Option A: Using PDFtoPrinter CLI if bundled (standard free Windows utility)
    // Option B: Using Windows PowerShell Print verb or Start-Process -Verb PrintTo
    const absoluteFilePath = path.resolve(options.filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      throw new Error(`Document file not found at ${absoluteFilePath}`);
    }

    // Windows PowerShell PrintTo command
    const safePrinterName = options.printerName.replace(/"/g, '`"');
    const psCommand = `powershell -NoProfile -Command "Start-Process -FilePath '${absoluteFilePath}' -Verb PrintTo -ArgumentList '${safePrinterName}' -PassThru | Out-Null"`;

    console.log(`[SPOOLER] Executing Windows Spooler: ${psCommand}`);
    await execAsync(psCommand);

    return { success: true };
  } catch (err: any) {
    console.error(`[SPOOLER ERROR] Failed to send document to printer:`, err);
    return { success: false, error: err.message || 'Spooler execution failed' };
  }
}
