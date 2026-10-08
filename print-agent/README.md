# Windows Print Agent - Digital Print Shop

The **Digital Print Windows Agent** is a lightweight, secure background service designed to run on the local print shop's Windows PC. It listens for verified print jobs, claims them with atomic locking, and spools them directly to physical Windows printers.

---

## Features

- **Zero SaaS Printing Dependency**: No PrintNode, ezeep, or proprietary recurring SaaS subscriptions required.
- **Hardware Integration**: Directly interfaces with local Windows Print Spooler via Windows API & PowerShell CIM instances.
- **Atomic Concurrency Protection**: Claims jobs with an atomic state transition (`QUEUED` -> `CLAIMED`) to eliminate duplicate prints across multiple shop computers.
- **Auto-Detection**: Automatically queries installed Windows printer drivers (HP, Canon, Epson, Xerox, Brother, etc.) and registers them with the admin dashboard.
- **Simulation Mode**: Run simulated printing without waste of paper for testing and setup validation.

---

## Requirements

- **Operating System**: Windows 10, Windows 11, or Windows Server (also runs in simulation mode on macOS/Linux).
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/)).
- **Printers**: Any printer installed and visible in Windows *Settings -> Bluetooth & devices -> Printers & scanners*.

---

## Setup & Running

### 1. Configure Settings
Create a `.env` file inside this `print-agent` folder:
```env
BACKEND_URL=http://localhost:3000
SHOP_ID=shop_digital_print_01
SHOP_API_KEY=agent_secret_key_change_in_production
PRINT_MODE=simulation
POLL_INTERVAL_MS=3000
```
*(Switch `PRINT_MODE=windows` when connecting to physical Windows printers!)*

### 2. Install & Run
Double-click `run-agent.bat` or run:
```bash
npm install
npm start
```

---

## Running as a Background Windows Service (Auto-Start on Boot)

To run the agent automatically whenever the print shop computer boots without requiring someone to open a command prompt:

1. Download **NSSM (Non-Sucking Service Manager)** from https://nssm.cc/
2. Open PowerShell as Administrator and run:
   ```powershell
   nssm install DigitalPrintAgent "C:\Program Files\nodejs\node.exe" "C:\path\to\print-agent\node_modules\tsx\dist\cli.mjs src\agent.ts"
   nssm set DigitalPrintAgent AppDirectory "C:\path\to\print-agent"
   nssm set DigitalPrintAgent Start SERVICE_AUTO_START
   nssm start DigitalPrintAgent
   ```
3. The service will now run continuously in the background!
