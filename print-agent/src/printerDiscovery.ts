/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DetectedPrinter {
  name: string;
  driverName?: string;
  isDefault?: boolean;
  supportsColor?: boolean;
  supportsA3?: boolean;
  supportsDuplex?: boolean;
}

export async function discoverWindowsPrinters(): Promise<DetectedPrinter[]> {
  const isWindows = process.platform === 'win32';

  if (!isWindows || process.env.PRINT_MODE === 'simulation') {
    // Simulated Windows Printers for development and testing
    return [
      {
        name: 'HP LaserJet Pro M404dn',
        driverName: 'HP PCL 6 Driver',
        isDefault: true,
        supportsColor: false,
        supportsA3: false,
        supportsDuplex: true,
      },
      {
        name: 'Canon imageRUNNER 2625 PCL6',
        driverName: 'Canon Generic Plus UFR II',
        isDefault: false,
        supportsColor: true,
        supportsA3: true,
        supportsDuplex: true,
      },
      {
        name: 'Epson L3150 Series',
        driverName: 'EPSON ESC/P-R',
        isDefault: false,
        supportsColor: true,
        supportsA3: false,
        supportsDuplex: false,
      },
    ];
  }

  try {
    // Windows PowerShell command to list all installed printers
    const psCommand = `powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object Name, Default, DriverName | ConvertTo-Json"`;
    const { stdout } = await execAsync(psCommand);
    const parsed = JSON.parse(stdout);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    return list.map((item: any) => ({
      name: item.Name,
      driverName: item.DriverName,
      isDefault: Boolean(item.Default),
      supportsColor: true,
      supportsA3: item.Name.toLowerCase().includes('ir') || item.Name.toLowerCase().includes('a3'),
      supportsDuplex: true,
    }));
  } catch (error) {
    console.warn('Could not query Windows Spooler service, fallback to default printer list:', error);
    return [
      {
        name: 'Default Windows Spooler Printer',
        isDefault: true,
        supportsColor: true,
        supportsA3: false,
        supportsDuplex: true,
      },
    ];
  }
}
