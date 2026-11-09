# workslacker

i built this tool to speed up my daily workflow at the service desk. when i'm taking calls and jumping between tekion and awp, i don't want to keep typing out the same price quote and status update emails over and over.

this sits open in a tab on my work computer so i can click a few buttons, paste a screenshot, and get the email into outlook in a couple seconds.

## what it does for me
- **switches email types fast:** i can toggle between a price quote, a status update, or a general callback request.
- **remembers my advisors:** i saved all our service advisors and their emails into my browser's local storage so i just click their name instead of typing it.
- **grabs the last 7 of the vin:** awp usually searches by the last 7 digits, so i added a button that copies just the last 7 characters straight to my clipboard.
- **one-click bmw services:** common stuff like oil service, brake fluid flush, microfilter, vehicle check, alignment, and tire swaps are just buttons i can click to add to the email.
- **screenshot paste + ocr:** after i take a snip (`win + shift + s`) of the customer's profile in tekion or awp, i just hit `ctrl + v` anywhere on the page. i also wired up tesseract ocr so it can read the screenshot and fill in the name, phone, customer number, and vin for me.
- **copies everything into outlook:** clicking the main copy button puts both the formatted email text and the screenshot onto my clipboard at the same time so i only have to paste once.

## how to open it
if you just want to open it in a browser:
- head to `https://kerwinmok.github.io/workslacker/` (once github pages is turned on in the repo settings), or
- clone this repo and double-click `index.html`. everything runs locally in the browser so no customer info ever leaves the computer.

## testing the java backend version
i also wrote a small java server inside `backend-java-example/DealershipBackendServer.java` just to mess around with rest apis and see how a java backend talks to a frontend. if you want to run that locally:

```bash
javac backend-java-example/DealershipBackendServer.java
java -cp backend-java-example DealershipBackendServer
```

then just open `http://localhost:8080`.
