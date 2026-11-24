# workslacker

i built this tool to speed up my daily workflow at the bmw, mini & rolls-royce service desk (all three brands share the same service advisors). instead of re-typing customer info into email templates while taking calls and jumping between tekion and awp, i launch one app off my usb drive, paste a screenshot or customer info, type the problem, and copy the email straight into outlook.

## screenshots

### service desk dashboard
![Service Desk Dashboard](docs/images/dashboard-view.png)

### advisors, cc & portable usb sync
![Advisors & USB Settings](docs/images/settings-view.png)

## how it works

1. **clipboard ocr & text parser (`app.js`):** hitting `ctrl + v` with an image boosts screenshot contrast on a hidden canvas, runs tesseract.js ocr, and passes the extracted text through `parseTekionOrAwpText` (or parses raw pasted text directly). it cleans common vin ocr mistakes (`O`/`Q` -> `0`, `I` -> `1`), normalizes phone formats to `XXX-XXX-XXXX`, and splits variable-length customer numbers (including brackets, hyphens, or `#`) from customer names while ignoring model years and street lines.
2. **awp & advisor formatting:** calculates `awp last 7 digits` live from any full 17-character bmw (`WBA...`), mini (`WMW...`, `WMZ...`), or rolls-royce (`SCA...`) vin and rebuilds `To`, `CC`, `Subject`, and the editable email body on every input or chip toggle.
3. **portable usb storage (`workslacker.bat` & `advisors-config.js`):** running `workslacker.bat` launches a hidden powershell tcp server on `127.0.0.1` paired with chrome `--app` mode (falling back to edge/default browser) so edits to advisors or cc presets auto-save straight back to `advisors.json` and `advisors-config.js` on the usb drive.

## one-click usb launch
1. copy this folder onto a usb drive.
2. double-click **`workslacker.bat`**.

it launches a clean standalone chrome app window (`--app` mode on `http://127.0.0.1:8765/`) backed by a zero-admin local server in powershell so all advisor and cc presets save straight back to **`advisors.json`** and **`advisors-config.js`** on the usb across any work pc.

- **optional chrome tab (`open-workslacker.html`):** after starting `workslacker.bat`, double-click **`open-workslacker.html`** to auto-detect the running server port (`8765`–`8785`) and jump straight to it in a regular chrome tab (falls back to `index.html` if the server isn't running).
- **offline notepad guide (`HOW-TO-RUN-USB.txt`):** quick-start and troubleshooting instructions right inside the usb folder in case anything happens on a work pc.

## backup plans if the work pc blocks the launcher
if work IT restricts `.bat` files, powershell, or usb execution, there are five ways to run it without admin rights:

1. **primary — `workslacker.bat`:** double-click `workslacker.bat` off the usb to start the local server and open chrome (`--app` mode) with auto-syncing `advisors.json` + `advisors-config.js`.
2. **browser redirect — `open-workslacker.html`:** double-click `open-workslacker.html` after running `workslacker.bat` to jump directly to the running server in chrome (or fall back to `index.html`).
3. **direct `file://` — double-click `index.html`:** opens straight in the browser with no server needed. `advisors-config.js` pre-loads all your saved advisors and cc presets without CORS issues. if you add an advisor here, use **`save advisors-config.js`** in **settings** to update `advisors-config.js` on the usb.
4. **browser app install (no `.bat`):** open `index.html` (or the hosted page) in chrome/edge, open the browser menu (`...`), and pick **apps -> install this site as an app** to pin the same standalone app window on that pc.
5. **hosted fallback — github pages + import:** open `https://kerwinmok.github.io/workslacker/` in any browser and use **import json** in settings to load `advisors.json` off your usb (settings also stay cached in that browser's localStorage).

## quick workflow
1. **paste (`ctrl + v`):** take a snip (`win + shift + s`) of the customer profile in tekion/awp or copy text and hit `ctrl + v` anywhere on the app. ocr and text parsing automatically extract:
   - **customer name & variable-length customer #** (shorter or longer ids like 3–10 digits, hyphens/dashes like `48-2910`, brackets `(4829)` / `[482910]`, or `#9821`)
   - **phone number** in any format (`6045550199`, `+1 [604] 555-0199`, `604.555.0199`, dashes/spaces) normalized to `604-555-0199`
   - **bmw, mini & rolls-royce vins** (`WBA...`, `WMW...`, `WMZ...`, `SCA...`, etc., plus 7-char awp short vins) with automatic ocr lookalike cleanup (`O`/`Q` -> `0`, `I` -> `1`)
2. **pick advisor, cc & problem:** the first advisor starts selected automatically (shared across bmw, mini, and rolls-royce), or i click a different advisor pill, add any cc contacts, click quick bmw/mini/rolls-royce service chips, and type the problem notes.
3. **copy into outlook:** `To`, `CC`, `Subject`, and the tailored `Email Body` update live with one-click copy buttons (`copy to`, `copy cc`, `copy subject`, `copy email body`, `copy body + screenshot`).

## reusable email templates and quick picks
- choose a saved template from the service desk or search by name/category, then click **fill** to populate the subject and body.
- use **save current email as template** or **advisors & cc → new template** to create one; edit, fill, and delete saved templates in the settings list.
- templates support `{{customerName}}`, `{{customerNumber}}`, `{{customerNumberLine}}`, `{{customerPhone}}`, `{{vin}}`, `{{advisorName}}`, `{{serviceDetails}}`, `{{customerAndNumber}}`, and `{{signature}}`. the body is stored as plain text with line breaks intact, then copied using the existing plain or rich email actions.
- add, edit, search, and remove service or problem quick picks in settings. Categories can be managed there and assigned to templates and quick picks.
- saved templates, services, and categories use browser `localStorage`; when launched with `workslacker.bat`, the same data is included in the portable `advisors.json` and `advisors-config.js` sync/export.

## repo files
- `workslacker.bat` — single-click portable usb launcher + local config server (opens chrome first)
- `open-workslacker.html` — chrome/browser launcher that finds the running `127.0.0.1` server or falls back to `index.html`
- `HOW-TO-RUN-USB.txt` — plain-text quick-start and troubleshooting guide for the usb folder
- `advisors.json` — saved service advisors, quick cc contacts, and signature
- `advisors-config.js` — `file://` backup preset script kept in sync alongside `advisors.json`
- `index.html`, `style.css`, `app.js` — dashboard ui, auto-ocr contrast boost, and email builder
