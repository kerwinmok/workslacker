# workslacker

i built this tool to speed up my daily workflow at the service desk. when i'm taking calls and jumping between tekion and awp, i don't want to keep typing out the same price quote and status update emails over and over.

i can run the whole thing straight off a usb drive on any work pc with zero installs, paste customer info or a tekion/awp screenshot, pick a service advisor and cc, and copy everything into outlook in a couple seconds.

## launching from a usb drive
copy the repo folder onto a usb stick and double-click:
- **`launch-workslacker.vbs`** (recommended) — opens workslacker in a clean standalone app window using edge/chrome `--app` mode with no command prompt window in the background.
- **`launch-workslacker.bat`** — same launcher with the local server console visible (falls back to opening `index.html` directly if powershell is restricted on a work computer).

when launched with the usb scripts, `usb-server.ps1` runs a local zero-admin server on `127.0.0.1` so any service advisors, cc contacts, or signature edits made inside settings save directly back to `advisors.json` and `advisors-config.js` on the usb stick.

## what it does for me
- **auto-ocr on screenshot paste:** take a snip (`win + shift + s`) of tekion or awp and hit `ctrl + v` anywhere on the page. it boosts image contrast, scans it automatically with tesseract, and fills in the customer's first/last name, phone number, and vin.
- **isolates 5-6 digit customer # from names:** if a customer's tekion/awp number is attached to their name (like `John Smith 482910` or `SMITH, JOHN - 482910`), it automatically splits the clean name into the name box and moves the 5-6 digit number into the customer # box.
- **quick cc & advisor selection:** click saved service advisors and quick cc presets loaded from `advisors.json`, or type them manually.
- **one-click outlook copy buttons:** separate `copy to`, `copy cc`, `copy subject`, `copy text body`, and `copy body + screenshot` buttons (plus `mailto:` support) tailored to the selected advisor.
- **grabs the last 7 of the vin:** awp searches by the last 7 characters, so one click copies just those 7 digits straight to the clipboard.
- **one-click bmw services:** common jobs like oil service, brake fluid flush, microfilter, vehicle check, alignment, and tire swaps toggle straight into the email body alongside the customer's problem notes.

## opening in a regular browser
if i just want to open it without the usb launcher:
- open `https://kerwinmok.github.io/workslacker/`, or double-click `index.html`.
- portable backups can also be exported or imported as `advisors.json` right inside **manage advisors & signature**.

## testing the java backend version
i also wrote a small java server inside `backend-java-example/DealershipBackendServer.java`:

```bash
javac backend-java-example/DealershipBackendServer.java
java -cp backend-java-example DealershipBackendServer
```

then open `http://localhost:8080`.
