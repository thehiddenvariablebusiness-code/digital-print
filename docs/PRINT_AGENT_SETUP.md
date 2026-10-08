# Windows Print Agent Setup Guide

The **Windows Print Agent** is a background daemon that runs on the print shop's counter PC. It communicates securely with the Digital Print backend and sends documents directly to local Windows printers.

---

## 1. Hardware & System Requirements

- **Operating System**: Windows 10, Windows 11, or Windows Server
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Printers**: Any standard printer driver (HP LaserJet, Canon imageRUNNER, Epson EcoTank, Xerox WorkCentre, etc.)

---

## 2. Step-by-Step Installation on Shop PC

1. Copy the `/print-agent` directory to the shop PC (e.g. `C:\DigitalPrintAgent`).
2. Open a terminal or PowerShell inside `C:\DigitalPrintAgent`:
   ```powershell
   npm install
   ```
3. Create a `.env` file with the shop's backend URL and API key:
   ```env
   BACKEND_URL=https://your-shop-app-url.run.app
   SHOP_ID=shop_digital_print_01
   SHOP_API_KEY=agent_secret_key_change_in_production
   PRINT_MODE=windows
   POLL_INTERVAL_MS=3000
   ```
4. Test running the agent:
   ```powershell
   npm start
   ```
   *You can also double-click `run-agent.bat`.*

---

## 3. Print Modes

- `PRINT_MODE=simulation`: Runs virtual print execution without wasting physical paper or ink. Great for initial testing!
- `PRINT_MODE=windows`: Sends print commands directly to the Windows Spooler service via PowerShell `PrintTo` verbs and driver commands.

---

## 4. Automatic Startup on Windows Boot

To start the agent automatically whenever the PC powers on:

1. Download **NSSM (Non-Sucking Service Manager)** from https://nssm.cc/
2. Run PowerShell as Administrator:
   ```powershell
   nssm install DigitalPrintAgent "C:\Program Files\nodejs\node.exe" "C:\DigitalPrintAgent\node_modules\tsx\dist\cli.mjs src\agent.ts"
   nssm set DigitalPrintAgent AppDirectory "C:\DigitalPrintAgent"
   nssm set DigitalPrintAgent Start SERVICE_AUTO_START
   nssm start DigitalPrintAgent
   ```
The agent will now run 24/7 in the background without needing a terminal window open.
