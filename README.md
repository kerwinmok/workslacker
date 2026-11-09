# workslacker — The BMW Store Service Coordinator Console

A fast, single-screen call-center web application built to streamline dispatching **Price Quotes**, **Status Updates**, and **Callbacks** to Service Advisors while working in **Tekion** and **AWP**.

## Features
- **Quick Mode Toggle:** Switch between Price Quote, Status Update, and Callback/General message formats in one click.
- **Advisor Pills & Local Persistence:** Save your Service Advisors and custom thank-you signature in your browser's `localStorage` so customer data never leaves your workstation.
- **AWP VIN Helper:** Paste a full 17-character VIN or 7-character VIN and click **Copy Last 7** to paste straight into AWP.
- **One-Tap BMW Service Chips:** Toggle common BMW services (*Oil Service, Brake Fluid Flush, Cabin Microfilter, Vehicle Check, Alignment, Tire Swap, Diagnostics*, etc.).
- **Screenshot Paste Zone (`Ctrl+V`) + Client-Side OCR:** Take a Windows Snip (`Win+Shift+S`) of Tekion/AWP and press `Ctrl+V` anywhere on the dashboard. Optionally scan the screenshot with Tesseract.js OCR to auto-fill Customer Name, Phone, Tekion Customer #, and VIN.
- **One-Click Outlook Dispatch:** Copy the Subject Line, or click **Copy Rich Email + Screenshot** to paste both the formatted email text and embedded screenshot directly into Outlook or webmail.

## Running on GitHub Pages (Zero Install at Work)
1. Go to your repository on GitHub: `https://github.com/kerwinmok/workslacker`
2. Click **Settings** -> **Pages** (on the left sidebar).
3. Under **Build and deployment** -> **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Wait ~60 seconds and open `https://kerwinmok.github.io/workslacker/` on your dealership computer.

## Running the Optional Java Backend Locally
If you want to experiment with how a Java server serves this app and handles JSON REST APIs:
```bash
javac backend-java-example/DealershipBackendServer.java
java -cp backend-java-example DealershipBackendServer
```
Then open `http://localhost:8080` in your browser.
