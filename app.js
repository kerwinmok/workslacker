// keys i use to save my settings in browser localstorage
const STORAGE_KEYS = {
  ADVISORS: "bmw_service_advisors_v1",
  SIGNATURE: "bmw_service_signature_v1",
  THEME: "bmw_service_theme_v1"
};

// starter list of advisors before i customize them in settings
const DEFAULT_ADVISORS = [
  { name: "Alex", email: "alex@thebmwstore.ca" },
  { name: "Jordan", email: "jordan@thebmwstore.ca" },
  { name: "Chris", email: "chris@thebmwstore.ca" },
  { name: "Taylor", email: "taylor@thebmwstore.ca" }
];

// my default email sign-off
const DEFAULT_SIGNATURE = "Thank you,\nKerwin\nService Coordinator | The BMW Store";

// keeps track of what i currently have selected on the screen
const appState = {
  mode: "quote",
  advisors: [],
  selectedAdvisorIndex: -1,
  selectedServices: [],
  signature: DEFAULT_SIGNATURE,
  screenshotDataUrl: "",
  screenshotBlob: null
};

// pull my saved advisors, signature, and theme from localstorage
function loadSavedSettings() {
  const savedAdvisorsRaw = localStorage.getItem(STORAGE_KEYS.ADVISORS);
  if (savedAdvisorsRaw) {
    try {
      appState.advisors = JSON.parse(savedAdvisorsRaw);
    } catch (err) {
      appState.advisors = DEFAULT_ADVISORS.slice();
    }
  } else {
    appState.advisors = DEFAULT_ADVISORS.slice();
  }

  const savedSignature = localStorage.getItem(STORAGE_KEYS.SIGNATURE);
  if (savedSignature !== null && savedSignature.trim() !== "") {
    appState.signature = savedSignature;
  } else {
    appState.signature = DEFAULT_SIGNATURE;
  }

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme === "light") {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.textContent = "switch to dark mode";
    }
  }
}

// save my advisor list and signature back to localstorage
function saveSettingsToStorage() {
  localStorage.setItem(STORAGE_KEYS.ADVISORS, JSON.stringify(appState.advisors));
  localStorage.setItem(STORAGE_KEYS.SIGNATURE, appState.signature);
}

// update the little status bar at the bottom right
function showToast(messageText) {
  const toastEl = document.getElementById("toast-message");
  if (!toastEl) {
    return;
  }
  toastEl.textContent = messageText;
}

// build the advisor buttons so i can click one instead of typing their email
function renderAdvisorPills() {
  const container = document.getElementById("advisor-pills");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  for (let i = 0; i < appState.advisors.length; i++) {
    const advisor = appState.advisors[i];
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "chip";
    if (i === appState.selectedAdvisorIndex) {
      pill.classList.add("active");
    }
    pill.textContent = advisor.name;

    pill.addEventListener("click", function () {
      appState.selectedAdvisorIndex = i;
      const nameInput = document.getElementById("advisor-name-input");
      const emailInput = document.getElementById("advisor-email-input");
      if (nameInput) {
        nameInput.value = advisor.name;
      }
      if (emailInput) {
        emailInput.value = advisor.email;
      }
      renderAdvisorPills();
      updateEmailPreview();
    });

    container.appendChild(pill);
  }
}

// show my saved advisors inside the settings popup so i can delete or add people
function renderSettingsAdvisorList() {
  const listEl = document.getElementById("settings-advisor-list");
  if (!listEl) {
    return;
  }
  listEl.innerHTML = "";

  for (let i = 0; i < appState.advisors.length; i++) {
    const advisor = appState.advisors[i];
    const row = document.createElement("div");
    row.className = "advisor-row-item";

    const infoSpan = document.createElement("span");
    infoSpan.textContent = advisor.name + " (" + advisor.email + ")";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger";
    removeBtn.textContent = "remove";
    removeBtn.addEventListener("click", function () {
      appState.advisors.splice(i, 1);
      if (appState.selectedAdvisorIndex === i) {
        appState.selectedAdvisorIndex = -1;
      }
      saveSettingsToStorage();
      renderAdvisorPills();
      renderSettingsAdvisorList();
      updateEmailPreview();
    });

    row.appendChild(infoSpan);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
  }
}

// combine whatever service chips i clicked with my custom notes box
function getRequestedServicesText() {
  const customNotesInput = document.getElementById("custom-notes");
  let customText = "";
  if (customNotesInput) {
    customText = customNotesInput.value.trim();
  }

  const combined = [];
  for (let i = 0; i < appState.selectedServices.length; i++) {
    combined.push(appState.selectedServices[i]);
  }
  if (customText !== "") {
    combined.push(customText);
  }

  if (combined.length === 0) {
    if (appState.mode === "quote") {
      return "[requested service]";
    }
    return "their vehicle";
  }

  return combined.join(", ");
}

// put together the subject line and email body live as i type
function updateEmailPreview() {
  const advisorNameEl = document.getElementById("advisor-name-input");
  const advisorEmailEl = document.getElementById("advisor-email-input");
  const customerNameEl = document.getElementById("customer-name");
  const customerPhoneEl = document.getElementById("customer-phone");
  const customerNumberEl = document.getElementById("customer-number");
  const customerVinEl = document.getElementById("customer-vin");

  let advisorName = "[Service Advisor Name]";
  if (advisorNameEl && advisorNameEl.value.trim() !== "") {
    advisorName = advisorNameEl.value.trim();
  }

  let advisorEmail = "";
  if (advisorEmailEl && advisorEmailEl.value.trim() !== "") {
    advisorEmail = advisorEmailEl.value.trim();
  }

  let customerName = "[Customer's Full Name]";
  if (customerNameEl && customerNameEl.value.trim() !== "") {
    customerName = customerNameEl.value.trim();
  }

  let phoneNumber = "[Phone Number]";
  if (customerPhoneEl && customerPhoneEl.value.trim() !== "") {
    phoneNumber = customerPhoneEl.value.trim();
  }

  let customerNumber = "[Tekion Customer #]";
  if (customerNumberEl && customerNumberEl.value.trim() !== "") {
    customerNumber = customerNumberEl.value.trim();
  }

  let vinValue = "[VIN]";
  if (customerVinEl && customerVinEl.value.trim() !== "") {
    vinValue = customerVinEl.value.trim().toUpperCase();
  }

  const serviceDetails = getRequestedServicesText();

  let subjectLine = "";
  let openingLine = "";

  if (appState.mode === "quote") {
    subjectLine = "Price Quote: " + customerName;
    openingLine = "Could you please give a price quote for " + serviceDetails + "?";
  } else if (appState.mode === "status") {
    subjectLine = "Status Update: " + customerName;
    openingLine = "Could you please provide a status update for " + customerName + " regarding " + serviceDetails + "?";
  } else {
    subjectLine = "Callback Request: " + customerName;
    openingLine = "Could you please give " + customerName + " a call back regarding " + serviceDetails + "?";
  }

  const bodyLines = [
    "Hello " + advisorName + ",",
    "",
    openingLine,
    "",
    "Customer Name: " + customerName,
    "Phone Number: " + phoneNumber,
    "Customer Number: " + customerNumber,
    "VIN (Last 7 / Full): " + vinValue,
    "",
    appState.signature
  ];

  const previewTo = document.getElementById("preview-to");
  const previewSubject = document.getElementById("preview-subject");
  const previewBody = document.getElementById("preview-body");

  if (previewTo) {
    previewTo.value = advisorEmail;
  }
  if (previewSubject) {
    previewSubject.value = subjectLine;
  }
  if (previewBody) {
    previewBody.value = bodyLines.join("\n");
  }
}

// grab just the last 7 characters of the vin so i can paste it into awp
function extractLast7Vin(rawVin) {
  const cleaned = rawVin.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 7) {
    return cleaned;
  }
  return cleaned.slice(cleaned.length - 7);
}

// pull out the vin, phone, customer #, and name from ocr or pasted tekion text
function parseTekionOrAwpText(rawText) {
  if (!rawText || rawText.trim() === "") {
    showToast("no text found to parse.");
    return;
  }

  let matchedCount = 0;

  // check for a full 17-character vin first
  const fullVinRegex = /\b([A-HJ-NPR-Z0-9]{17})\b/i;
  const fullVinMatch = rawText.match(fullVinRegex);
  if (fullVinMatch) {
    const vinInput = document.getElementById("customer-vin");
    if (vinInput) {
      vinInput.value = fullVinMatch[1].toUpperCase();
      matchedCount = matchedCount + 1;
    }
  } else {
    // otherwise check if it says vin: followed by at least 7 characters
    const shortVinRegex = /vin\s*[:#-]*\s*([A-Z0-9]{7,17})/i;
    const shortVinMatch = rawText.match(shortVinRegex);
    if (shortVinMatch) {
      const vinInput = document.getElementById("customer-vin");
      if (vinInput) {
        vinInput.value = shortVinMatch[1].toUpperCase();
        matchedCount = matchedCount + 1;
      }
    }
  }

  // look for a 10-digit phone number
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-9]{2})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = rawText.match(phoneRegex);
  if (phoneMatch) {
    const formattedPhone = phoneMatch[1] + "-" + phoneMatch[2] + "-" + phoneMatch[3];
    const phoneInput = document.getElementById("customer-phone");
    if (phoneInput) {
      phoneInput.value = formattedPhone;
      matchedCount = matchedCount + 1;
    }
  }

  // look for tekion customer number
  const custNumRegex = /(?:customer\s*(?:id|no|num|number|#)|cust\s*#|account\s*#)\s*[:#-]*\s*([0-9]{4,10})/i;
  const custNumMatch = rawText.match(custNumRegex);
  if (custNumMatch) {
    const custInput = document.getElementById("customer-number");
    if (custInput) {
      custInput.value = custNumMatch[1];
      matchedCount = matchedCount + 1;
    }
  }

  // look for customer name
  const nameRegex = /(?:customer\s*name|client\s*name|name)\s*[:#-]\s*([A-Za-z][A-Za-z\s'-]{2,40})/i;
  const nameMatch = rawText.match(nameRegex);
  if (nameMatch) {
    const cleanedName = nameMatch[1].split("\n")[0].trim();
    const nameInput = document.getElementById("customer-name");
    if (nameInput) {
      nameInput.value = cleanedName;
      matchedCount = matchedCount + 1;
    }
  }

  updateEmailPreview();
  showToast("parsed text and auto-filled " + matchedCount + " field(s).");
}

// show my pasted screenshot in the middle column
function handleScreenshotBlob(blob) {
  if (!blob) {
    return;
  }
  appState.screenshotBlob = blob;

  const reader = new FileReader();
  reader.onload = function (event) {
    appState.screenshotDataUrl = event.target.result;
    const imgEl = document.getElementById("screenshot-img");
    const previewWrap = document.getElementById("screenshot-preview-wrap");
    const placeholder = document.getElementById("paste-placeholder");
    const ocrBtn = document.getElementById("run-ocr-btn");
    const clearBtn = document.getElementById("clear-screenshot-btn");
    const statusText = document.getElementById("ocr-status-text");

    if (imgEl) {
      imgEl.src = appState.screenshotDataUrl;
    }
    if (previewWrap) {
      previewWrap.classList.remove("hidden");
    }
    if (placeholder) {
      placeholder.classList.add("hidden");
    }
    if (ocrBtn) {
      ocrBtn.disabled = false;
    }
    if (clearBtn) {
      clearBtn.disabled = false;
    }
    if (statusText) {
      statusText.textContent = "screenshot attached! click 'scan screenshot' to auto-fill fields, or copy rich email.";
    }
    showToast("screenshot pasted into dashboard.");
  };
  reader.readAsDataURL(blob);
}

// run tesseract ocr on my screenshot to auto-fill the form
async function runScreenshotOcr() {
  if (!appState.screenshotDataUrl) {
    showToast("paste a screenshot first before running ocr.");
    return;
  }

  const statusText = document.getElementById("ocr-status-text");
  const ocrBtn = document.getElementById("run-ocr-btn");

  if (!window.Tesseract) {
    if (statusText) {
      statusText.textContent = "tesseract library is not available offline. use quick text parser below.";
    }
    return;
  }

  if (ocrBtn) {
    ocrBtn.disabled = true;
  }
  if (statusText) {
    statusText.textContent = "scanning screenshot with ocr... please wait a moment.";
  }

  try {
    const result = await window.Tesseract.recognize(appState.screenshotDataUrl, "eng");
    const extractedText = result.data.text;
    const rawBox = document.getElementById("raw-screen-text");
    if (rawBox) {
      rawBox.value = extractedText;
    }
    parseTekionOrAwpText(extractedText);
    if (statusText) {
      statusText.textContent = "ocr scan complete! verify extracted fields on the left.";
    }
  } catch (err) {
    if (statusText) {
      statusText.textContent = "ocr scan encountered an error. you can still copy the screenshot with your email.";
    }
  } finally {
    if (ocrBtn) {
      ocrBtn.disabled = false;
    }
  }
}

// clean up special characters before building html for the clipboard
function escapeHtml(rawStr) {
  return rawStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// copy both the email text and the screenshot together so i can ctrl+v once in outlook
async function copyRichEmailWithScreenshot() {
  const previewBody = document.getElementById("preview-body");
  let plainText = "";
  if (previewBody) {
    plainText = previewBody.value;
  }

  const htmlParagraphs = escapeHtml(plainText).replace(/\n/g, "<br>");
  let fullHtml = "<div style=\"font-family: Calibri, Arial, sans-serif; font-size: 11pt;\">" + htmlParagraphs;

  if (appState.screenshotDataUrl !== "") {
    fullHtml = fullHtml + "<br><br><img src=\"" + appState.screenshotDataUrl + "\" alt=\"Tekion AWP Screenshot\" style=\"max-width: 720px; border: 1px solid #cccccc;\" />";
  }
  fullHtml = fullHtml + "</div>";

  try {
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      const htmlBlob = new Blob([fullHtml], { type: "text/html" });
      const textBlob = new Blob([plainText], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob
      });
      await navigator.clipboard.write([item]);
      showToast("copied rich email + screenshot! press ctrl+v inside outlook email body.");
      return;
    }
  } catch (err) {
    // if the browser blocks html clipboard, fall back to plain text
  }

  await navigator.clipboard.writeText(plainText);
  showToast("copied plain text body to clipboard.");
}

// wipe the form clean when the next customer calls in
function resetCallForm() {
  const fieldIds = [
    "customer-name",
    "customer-phone",
    "customer-number",
    "customer-vin",
    "custom-notes",
    "raw-screen-text"
  ];

  for (let i = 0; i < fieldIds.length; i++) {
    const el = document.getElementById(fieldIds[i]);
    if (el) {
      el.value = "";
    }
  }

  appState.selectedServices = [];
  const serviceButtons = document.querySelectorAll(".service-chip");
  for (let i = 0; i < serviceButtons.length; i++) {
    serviceButtons[i].classList.remove("active");
  }

  // clear out the old screenshot
  appState.screenshotDataUrl = "";
  appState.screenshotBlob = null;
  const imgEl = document.getElementById("screenshot-img");
  const previewWrap = document.getElementById("screenshot-preview-wrap");
  const placeholder = document.getElementById("paste-placeholder");
  const ocrBtn = document.getElementById("run-ocr-btn");
  const clearBtn = document.getElementById("clear-screenshot-btn");
  const statusText = document.getElementById("ocr-status-text");

  if (imgEl) {
    imgEl.src = "";
  }
  if (previewWrap) {
    previewWrap.classList.add("hidden");
  }
  if (placeholder) {
    placeholder.classList.remove("hidden");
  }
  if (ocrBtn) {
    ocrBtn.disabled = true;
  }
  if (clearBtn) {
    clearBtn.disabled = true;
  }
  if (statusText) {
    statusText.textContent = "waiting for screenshot paste...";
  }

  const vinHelper = document.getElementById("vin-helper-text");
  if (vinHelper) {
    vinHelper.textContent = "paste full vin or 7 chars for awp";
  }

  updateEmailPreview();
  showToast("cleared form for new incoming call.");
}

// hook up all the buttons and inputs once the page loads
function initializeDashboardEvents() {
  loadSavedSettings();
  renderAdvisorPills();
  renderSettingsAdvisorList();

  const sigInput = document.getElementById("signature-input");
  if (sigInput) {
    sigInput.value = appState.signature;
  }

  // switching between price quote, status update, and callback
  const modeButtons = document.querySelectorAll(".mode-btn");
  for (let i = 0; i < modeButtons.length; i++) {
    modeButtons[i].addEventListener("click", function () {
      for (let j = 0; j < modeButtons.length; j++) {
        modeButtons[j].classList.remove("active");
      }
      modeButtons[i].classList.add("active");
      appState.mode = modeButtons[i].getAttribute("data-mode");

      const notesLabel = document.getElementById("custom-notes-label");
      if (notesLabel) {
        if (appState.mode === "quote") {
          notesLabel.textContent = "additional service details / quote notes";
        } else if (appState.mode === "status") {
          notesLabel.textContent = "status inquiry details (e.g. dropped off this morning)";
        } else {
          notesLabel.textContent = "callback reason / message for advisor";
        }
      }
      updateEmailPreview();
    });
  }

  // clicking on bmw service chips
  const serviceButtons = document.querySelectorAll(".service-chip");
  for (let i = 0; i < serviceButtons.length; i++) {
    serviceButtons[i].addEventListener("click", function () {
      const serviceName = serviceButtons[i].getAttribute("data-service");
      const existingIndex = appState.selectedServices.indexOf(serviceName);
      if (existingIndex === -1) {
        appState.selectedServices.push(serviceName);
        serviceButtons[i].classList.add("active");
      } else {
        appState.selectedServices.splice(existingIndex, 1);
        serviceButtons[i].classList.remove("active");
      }
      updateEmailPreview();
    });
  }

  // update the email preview whenever i type in any text box
  const liveFieldIds = [
    "advisor-name-input",
    "advisor-email-input",
    "customer-name",
    "customer-phone",
    "customer-number",
    "customer-vin",
    "custom-notes"
  ];

  for (let i = 0; i < liveFieldIds.length; i++) {
    const inputEl = document.getElementById(liveFieldIds[i]);
    if (inputEl) {
      inputEl.addEventListener("input", function () {
        if (liveFieldIds[i] === "customer-vin") {
          const last7 = extractLast7Vin(inputEl.value);
          const helper = document.getElementById("vin-helper-text");
          if (helper) {
            if (last7.length > 0) {
              helper.textContent = "awp last 7 digits: " + last7;
            } else {
              helper.textContent = "paste full vin or 7 chars for awp";
            }
          }
        }
        updateEmailPreview();
      });
    }
  }

  // button to copy just the last 7 of the vin for awp
  const copyLast7Btn = document.getElementById("copy-last7-btn");
  if (copyLast7Btn) {
    copyLast7Btn.addEventListener("click", async function () {
      const vinEl = document.getElementById("customer-vin");
      if (!vinEl || vinEl.value.trim() === "") {
        showToast("enter a vin first to copy last 7 digits.");
        return;
      }
      const last7 = extractLast7Vin(vinEl.value);
      await navigator.clipboard.writeText(last7);
      showToast("copied last 7 vin (" + last7 + ") for awp!");
    });
  }

  // listen for ctrl+v anywhere on the page to grab my snipping tool screenshot
  window.addEventListener("paste", function (event) {
    if (!event.clipboardData || !event.clipboardData.items) {
      return;
    }
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        handleScreenshotBlob(blob);
        event.preventDefault();
        return;
      }
    }
  });

  // manual image upload if i pick a file instead of pasting
  const fileUploadInput = document.getElementById("file-upload-input");
  if (fileUploadInput) {
    fileUploadInput.addEventListener("change", function (event) {
      if (event.target.files && event.target.files[0]) {
        handleScreenshotBlob(event.target.files[0]);
      }
    });
  }

  // ocr scan and remove screenshot buttons
  const runOcrBtn = document.getElementById("run-ocr-btn");
  if (runOcrBtn) {
    runOcrBtn.addEventListener("click", function () {
      runScreenshotOcr();
    });
  }

  const clearScreenshotBtn = document.getElementById("clear-screenshot-btn");
  if (clearScreenshotBtn) {
    clearScreenshotBtn.addEventListener("click", function () {
      appState.screenshotDataUrl = "";
      appState.screenshotBlob = null;
      const imgEl = document.getElementById("screenshot-img");
      const previewWrap = document.getElementById("screenshot-preview-wrap");
      const placeholder = document.getElementById("paste-placeholder");
      const statusText = document.getElementById("ocr-status-text");
      if (imgEl) {
        imgEl.src = "";
      }
      if (previewWrap) {
        previewWrap.classList.add("hidden");
      }
      if (placeholder) {
        placeholder.classList.remove("hidden");
      }
      if (runOcrBtn) {
        runOcrBtn.disabled = true;
      }
      clearScreenshotBtn.disabled = true;
      if (statusText) {
        statusText.textContent = "screenshot removed.";
      }
    });
  }

  // extract fields from raw copied tekion text
  const parseTextBtn = document.getElementById("parse-text-btn");
  if (parseTextBtn) {
    parseTextBtn.addEventListener("click", function () {
      const rawBox = document.getElementById("raw-screen-text");
      if (rawBox) {
        parseTekionOrAwpText(rawBox.value);
      }
    });
  }

  // buttons for copying advisor email, subject line, body, and opening mailto
  const copyEmailAddrBtn = document.getElementById("copy-email-addr-btn");
  if (copyEmailAddrBtn) {
    copyEmailAddrBtn.addEventListener("click", async function () {
      const toEl = document.getElementById("preview-to");
      if (toEl && toEl.value.trim() !== "") {
        await navigator.clipboard.writeText(toEl.value.trim());
        showToast("copied advisor email address.");
      } else {
        showToast("select an advisor first.");
      }
    });
  }

  const copySubjectBtn = document.getElementById("copy-subject-btn");
  if (copySubjectBtn) {
    copySubjectBtn.addEventListener("click", async function () {
      const subjEl = document.getElementById("preview-subject");
      if (subjEl) {
        await navigator.clipboard.writeText(subjEl.value);
        showToast("copied subject line to clipboard!");
      }
    });
  }

  const copyRichBtn = document.getElementById("copy-rich-email-btn");
  if (copyRichBtn) {
    copyRichBtn.addEventListener("click", function () {
      copyRichEmailWithScreenshot();
    });
  }

  const copyPlainBtn = document.getElementById("copy-plain-body-btn");
  if (copyPlainBtn) {
    copyPlainBtn.addEventListener("click", async function () {
      const bodyEl = document.getElementById("preview-body");
      if (bodyEl) {
        await navigator.clipboard.writeText(bodyEl.value);
        showToast("copied plain email body to clipboard.");
      }
    });
  }

  const openMailtoBtn = document.getElementById("open-mailto-btn");
  if (openMailtoBtn) {
    openMailtoBtn.addEventListener("click", function () {
      const toEl = document.getElementById("preview-to");
      const subjEl = document.getElementById("preview-subject");
      const bodyEl = document.getElementById("preview-body");

      let toAddr = "";
      if (toEl) {
        toAddr = toEl.value.trim();
      }
      let subject = "";
      if (subjEl) {
        subject = encodeURIComponent(subjEl.value);
      }
      let body = "";
      if (bodyEl) {
        body = encodeURIComponent(bodyEl.value);
      }

      window.location.href = "mailto:" + toAddr + "?subject=" + subject + "&body=" + body;
      showToast("opened default mail client. press ctrl+v in body if pasting screenshot.");
    });
  }

  // toggle between dark mode and light mode
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const isLight = document.body.classList.contains("light-theme");
      if (isLight) {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        themeToggleBtn.textContent = "switch to light mode";
        localStorage.setItem(STORAGE_KEYS.THEME, "dark");
      } else {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "switch to dark mode";
        localStorage.setItem(STORAGE_KEYS.THEME, "light");
      }
    });
  }

  // open and close the advisor settings popup
  const manageAdvisorsBtn = document.getElementById("manage-advisors-btn");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const settingsModal = document.getElementById("settings-modal");

  if (manageAdvisorsBtn && settingsModal) {
    manageAdvisorsBtn.addEventListener("click", function () {
      settingsModal.classList.remove("hidden");
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener("click", function () {
      if (sigInput) {
        appState.signature = sigInput.value;
      }
      saveSettingsToStorage();
      updateEmailPreview();
      settingsModal.classList.add("hidden");
      showToast("saved advisor directory and signature settings.");
    });
  }

  // add a new advisor to my saved list
  const addAdvisorBtn = document.getElementById("add-advisor-btn");
  if (addAdvisorBtn) {
    addAdvisorBtn.addEventListener("click", function () {
      const nameEl = document.getElementById("new-advisor-name");
      const emailEl = document.getElementById("new-advisor-email");
      if (!nameEl || !emailEl) {
        return;
      }
      const nameVal = nameEl.value.trim();
      const emailVal = emailEl.value.trim();
      if (nameVal === "" || emailVal === "") {
        showToast("enter both advisor name and email.");
        return;
      }
      appState.advisors.push({ name: nameVal, email: emailVal });
      nameEl.value = "";
      emailEl.value = "";
      saveSettingsToStorage();
      renderAdvisorPills();
      renderSettingsAdvisorList();
      showToast("added advisor " + nameVal + ".");
    });
  }

  // reset button and alt+r shortcut for when a new call comes in
  const resetBtn = document.getElementById("reset-form-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetCallForm();
    });
  }

  window.addEventListener("keydown", function (event) {
    if (event.altKey && (event.key === "r" || event.key === "R")) {
      event.preventDefault();
      resetCallForm();
    }
  });

  updateEmailPreview();
}

document.addEventListener("DOMContentLoaded", initializeDashboardEvents);
