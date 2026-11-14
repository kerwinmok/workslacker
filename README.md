# workslacker

i built this tool to speed up my daily workflow at the service desk. instead of re-typing customer info into email templates while taking calls and jumping between tekion and awp, i launch one app off my usb drive, paste a screenshot or customer info, type the problem, and copy the email straight into outlook.

## one-click usb launch
1. copy this folder onto a usb drive.
2. double-click **`workslacker.bat`**.

it launches a clean standalone app window (edge/chrome `--app` mode) backed by a zero-admin local server in powershell so all advisor and cc presets save straight back to **`advisors.json`** on the usb across any work pc. (if powershell is restricted on a machine, `workslacker.bat` falls back to opening `index.html` in app mode directly.)

## quick workflow
1. **paste (`ctrl + v`):** take a snip (`win + shift + s`) of the customer profile in tekion/awp or copy text and hit `ctrl + v` anywhere on the app. ocr automatically extracts the customer name, separates out any 5-6 digit customer # attached to their name (e.g. `SMITH, JOHN 482910`), grabs the phone number, and fills in the vin.
2. **pick advisor, cc & problem:** the first advisor starts selected automatically, or i click a different advisor pill, add any cc contacts, click quick bmw service chips, and type the problem notes.
3. **copy into outlook:** `To`, `CC`, `Subject`, and the tailored `Email Body` update live with one-click copy buttons (`copy to`, `copy cc`, `copy subject`, `copy email body`, `copy body + screenshot`).

## repo files
- `workslacker.bat` — single-click portable usb launcher + local config server
- `advisors.json` — saved service advisors, quick cc contacts, and signature
- `index.html`, `style.css`, `app.js` — dashboard ui, auto-ocr contrast boost, and email builder
