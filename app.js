// keys i use to save my settings in browser localstorage
const STORAGE_KEYS = {
  ADVISORS: "bmw_service_advisors_v1",
  CC_LIST: "bmw_service_cc_v1",
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

// starter list of quick cc contacts
const DEFAULT_CC_LIST = [
  { name: "Service Dispatch", email: "dispatch@thebmwstore.ca" },
  { name: "BDC / Appointments", email: "appointments@thebmwstore.ca" }
];

// my default email sign-off
const DEFAULT_SIGNATURE = "Thank you,\nKerwin\nService Coordinator | The BMW Store";

// shared vin prefixes (bmw, mini, and rolls-royce) and text parsing regexes
const KNOWN_VIN_PREFIXES = ["WBA", "WBS", "WBY", "WBW", "WMW", "WMZ", "5UX", "5YM", "3MW", "4US", "SCA", "SBA"];
const NON_NAME_WORD_REGEX = /\b(ave|avenue|st|street|rd|road|blvd|drive|dr|hwy|suite|unit|apt|bmw|rolls|royce|ghost|phantom|cullinan|spectre|wraith|dawn|mini|cooper|countryman|clubman|paceman|jcw|hardtop|convertible|aceman|tekion|awp|customer|client|odometer|mileage|km|mi|status|active|inactive|pending|service|appointment|advisor|vin|ro|repair|order|year|model|vehicle|plate|license)\b/i;
const PHONE_EXTRACT_REGEX = /(?:^|[^0-9A-Za-z])((?:\+?1[-.\s\u2013\u2014]*)?[\[(]?[2-9][0-9]{2}[\])]?[-.\s\u2013\u2014]*[0-9]{3}[-.\s\u2013\u2014]*[0-9]{4})(?![0-9])/;
const PHONE_SCRUB_REGEX = /(?:^|[^0-9A-Za-z])(?:\+?1[-.\s\u2013\u2014]*)?[\[(]?[2-9][0-9]{2}[\])]?[-.\s\u2013\u2014]*[0-9]{3}[-.\s\u2013\u2014]*[0-9]{4}(?![0-9])/g;

// keeps track of what i currently have selected on the screen
const appState = {
  mode: "quote",
  advisors: [],
  ccContacts: [],
  selectedCcEmails: [],
  selectedAdvisorIndex: -1,
  selectedServices: [],
  signature: DEFAULT_SIGNATURE,
  screenshotDataUrl: "",
  screenshotBlob: null
};

// check whether we are running from the local usb server
function isLocalUsbServer() {
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
    return false;
  }
  const host = window.location.hostname;
  if (host === "127.0.0.1" || host === "localhost") {
    return true;
  }
  return false;
}

// build a single portable config payload for localstorage, usb json, and export
function buildConfigPayload() {
  return {
    advisors: appState.advisors,
    ccList: appState.ccContacts,
    signature: appState.signature
  };
}

// apply a parsed config object onto appState safely
function applyConfigObject(cfg) {
  if (!cfg || typeof cfg !== "object") {
    return false;
  }
  if (Array.isArray(cfg.advisors)) {
    appState.advisors = cfg.advisors;
  }
  if (Array.isArray(cfg.ccList)) {
    appState.ccContacts = cfg.ccList;
  }
  if (typeof cfg.signature === "string" && cfg.signature.trim() !== "") {
    appState.signature = cfg.signature;
  }
  return true;
}

// update usb sync note inside the settings popup
function setUsbSyncStatus(text) {
  const statusEl = document.getElementById("usb-sync-status");
  if (statusEl) {
    statusEl.textContent = text;
  }
}

// pull my saved advisors, cc list, signature, and theme from usb fallback + localstorage
function loadSavedSettings() {
  if (window.USB_SAVED_CONFIG) {
    applyConfigObject(window.USB_SAVED_CONFIG);
  } else {
    appState.advisors = DEFAULT_ADVISORS.slice();
    appState.ccContacts = DEFAULT_CC_LIST.slice();
    appState.signature = DEFAULT_SIGNATURE;
  }

  const savedAdvisorsRaw = localStorage.getItem(STORAGE_KEYS.ADVISORS);
  if (savedAdvisorsRaw) {
    try {
      appState.advisors = JSON.parse(savedAdvisorsRaw);
    } catch (err) {
      // keep default list
    }
  }

  const savedCcRaw = localStorage.getItem(STORAGE_KEYS.CC_LIST);
  if (savedCcRaw) {
    try {
      appState.ccContacts = JSON.parse(savedCcRaw);
    } catch (err) {
      // keep default list
    }
  }

  const savedSignature = localStorage.getItem(STORAGE_KEYS.SIGNATURE);
  if (savedSignature !== null && savedSignature.trim() !== "") {
    appState.signature = savedSignature;
  }

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme === "light") {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.textContent = "dark mode";
    }
  }
}

// select an advisor by index and populate the to fields
function selectAdvisorByIndex(idx) {
  if (idx < 0 || idx >= appState.advisors.length) {
    return;
  }
  const advisor = appState.advisors[idx];
  appState.selectedAdvisorIndex = idx;
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
}

// pull the latest advisors.json from my local usb server so changes carry across pcs
async function syncConfigFromUsbServer() {
  if (!isLocalUsbServer()) {
    setUsbSyncStatus("browser mode — changes save locally (use export for advisors.json backup).");
    return;
  }

  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const cfg = await response.json();
    if (applyConfigObject(cfg)) {
      localStorage.setItem(STORAGE_KEYS.ADVISORS, JSON.stringify(appState.advisors));
      localStorage.setItem(STORAGE_KEYS.CC_LIST, JSON.stringify(appState.ccContacts));
      localStorage.setItem(STORAGE_KEYS.SIGNATURE, appState.signature);

      const sigInput = document.getElementById("signature-input");
      if (sigInput) {
        sigInput.value = appState.signature;
      }
      if (appState.advisors.length > 0 && (appState.selectedAdvisorIndex < 0 || appState.selectedAdvisorIndex >= appState.advisors.length)) {
        selectAdvisorByIndex(0);
      } else if (appState.selectedAdvisorIndex >= 0 && appState.selectedAdvisorIndex < appState.advisors.length) {
        selectAdvisorByIndex(appState.selectedAdvisorIndex);
      } else {
        renderAdvisorPills();
      }
      renderSettingsAdvisorList();
      renderCcPills();
      renderSettingsCcList();
      updateEmailPreview();
      setUsbSyncStatus("connected — advisors and cc presets auto-save to advisors.json.");
    }
  } catch (err) {
    setUsbSyncStatus("could not reach local server — using browser storage.");
  }
}

// write config changes back to the usb drive when launched via usb launcher
async function syncConfigToUsbServer() {
  if (!isLocalUsbServer()) {
    return;
  }
  try {
    const response = await fetch("/api/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildConfigPayload())
    });
    if (response.ok) {
      setUsbSyncStatus("saved to usb advisors.json and browser storage.");
    }
  } catch (err) {
    setUsbSyncStatus("usb file write failed — saved in browser storage.");
  }
}

// save my advisor list, cc list, and signature to both browser storage and usb config
function saveSettingsToStorage() {
  localStorage.setItem(STORAGE_KEYS.ADVISORS, JSON.stringify(appState.advisors));
  localStorage.setItem(STORAGE_KEYS.CC_LIST, JSON.stringify(appState.ccContacts));
  localStorage.setItem(STORAGE_KEYS.SIGNATURE, appState.signature);
  syncConfigToUsbServer();
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
      selectAdvisorByIndex(i);
    });

    container.appendChild(pill);
  }
}

// split a comma or semicolon list of emails into a clean deduplicated array
function parseEmailList(rawValue) {
  if (!rawValue || rawValue.trim() === "") {
    return [];
  }
  const parts = rawValue.split(/[,;]+/);
  const cleaned = [];
  for (let i = 0; i < parts.length; i++) {
    const email = parts[i].trim();
    if (email !== "" && cleaned.indexOf(email) === -1) {
      cleaned.push(email);
    }
  }
  return cleaned;
}

// build quick cc buttons so i can click to add/remove cc recipients
function renderCcPills() {
  const container = document.getElementById("cc-pills");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  const ccInput = document.getElementById("cc-email-input");
  let currentEmails = [];
  if (ccInput) {
    currentEmails = parseEmailList(ccInput.value);
  }
  appState.selectedCcEmails = currentEmails;

  for (let i = 0; i < appState.ccContacts.length; i++) {
    const contact = appState.ccContacts[i];
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "chip";
    if (currentEmails.indexOf(contact.email) !== -1) {
      pill.classList.add("active");
    }
    pill.textContent = contact.name;

    pill.addEventListener("click", function () {
      const box = document.getElementById("cc-email-input");
      let list = [];
      if (box) {
        list = parseEmailList(box.value);
      }
      const idx = list.indexOf(contact.email);
      if (idx === -1) {
        list.push(contact.email);
      } else {
        list.splice(idx, 1);
      }
      if (box) {
        box.value = list.join(", ");
      }
      appState.selectedCcEmails = list;
      renderCcPills();
      updateEmailPreview();
    });

    container.appendChild(pill);
  }
}

// show my saved cc contacts inside settings so i can add or delete them
function renderSettingsCcList() {
  const listEl = document.getElementById("settings-cc-list");
  if (!listEl) {
    return;
  }
  listEl.innerHTML = "";

  for (let i = 0; i < appState.ccContacts.length; i++) {
    const contact = appState.ccContacts[i];
    const row = document.createElement("div");
    row.className = "advisor-row-item";

    const infoSpan = document.createElement("span");
    infoSpan.textContent = contact.name + " (" + contact.email + ")";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger";
    removeBtn.textContent = "remove";
    removeBtn.addEventListener("click", function () {
      appState.ccContacts.splice(i, 1);
      saveSettingsToStorage();
      renderCcPills();
      renderSettingsCcList();
      updateEmailPreview();
    });

    row.appendChild(infoSpan);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
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
      return "[problem / requested service]";
    }
    return "[details / inquiry]";
  }

  return combined.join(", ");
}

// put together the subject line and email body live as i type
function updateEmailPreview() {
  const advisorNameEl = document.getElementById("advisor-name-input");
  const advisorEmailEl = document.getElementById("advisor-email-input");
  const ccEmailEl = document.getElementById("cc-email-input");
  const customerNameEl = document.getElementById("customer-name");
  const customerPhoneEl = document.getElementById("customer-phone");
  const customerNumberEl = document.getElementById("customer-number");
  const customerVinEl = document.getElementById("customer-vin");

  let advisorName = "[Service Advisor]";
  if (advisorNameEl && advisorNameEl.value.trim() !== "") {
    advisorName = advisorNameEl.value.trim();
  }

  let advisorEmail = "";
  if (advisorEmailEl && advisorEmailEl.value.trim() !== "") {
    advisorEmail = advisorEmailEl.value.trim();
  }

  let ccEmail = "";
  if (ccEmailEl && ccEmailEl.value.trim() !== "") {
    ccEmail = parseEmailList(ccEmailEl.value).join(", ");
  }

  let customerName = "[Customer Name]";
  if (customerNameEl && customerNameEl.value.trim() !== "") {
    customerName = customerNameEl.value.trim();
  }

  let phoneNumber = "[Phone Number]";
  if (customerPhoneEl && customerPhoneEl.value.trim() !== "") {
    phoneNumber = customerPhoneEl.value.trim();
  }

  let customerNumber = "";
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
    openingLine = "Could you please provide a price quote for the request below?";
  } else if (appState.mode === "status") {
    subjectLine = "Status Update: " + customerName;
    openingLine = "Could you please provide a status update for the customer below?";
  } else {
    subjectLine = "Callback Request: " + customerName;
    openingLine = "Could you please give the customer below a call back?";
  }

  const bodyLines = [
    "Hello " + advisorName + ",",
    "",
    openingLine,
    "",
    "Customer Name: " + customerName
  ];

  if (customerNumber !== "") {
    bodyLines.push("Customer #: " + customerNumber);
  }

  bodyLines.push("Phone Number: " + phoneNumber);
  bodyLines.push("VIN (Last 7 / Full): " + vinValue);
  bodyLines.push("Problem / Service: " + serviceDetails);
  bodyLines.push("");
  bodyLines.push(appState.signature);

  const previewTo = document.getElementById("preview-to");
  const previewCc = document.getElementById("preview-cc");
  const previewSubject = document.getElementById("preview-subject");
  const previewBody = document.getElementById("preview-body");

  if (previewTo) {
    previewTo.value = advisorEmail;
  }
  if (previewCc) {
    previewCc.value = ccEmail;
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

// clean up a vin candidate and fix common ocr lookalikes (O/Q -> 0, I -> 1)
function normalizeVinCandidate(rawToken, allowShort) {
  if (!rawToken) {
    return "";
  }

  const compact = String(rawToken).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length === 0) {
    return "";
  }

  const rawDigitMatches = compact.match(/[0-9]/g);
  let rawDigitCount = 0;
  if (rawDigitMatches) {
    rawDigitCount = rawDigitMatches.length;
  }

  // iso 3779 vins never use I, O, or Q, so map those ocr mistakes back to digits when digits exist
  let fixed = compact;
  if (rawDigitCount >= 1) {
    fixed = compact.replace(/[OQ]/g, "0").replace(/I/g, "1");
  }

  const fixedDigitMatches = fixed.match(/[0-9]/g);
  let fixedDigitCount = 0;
  if (fixedDigitMatches) {
    fixedDigitCount = fixedDigitMatches.length;
  }

  if (fixed.length === 17) {
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(fixed) && rawDigitCount >= 1 && fixedDigitCount >= 3) {
      return fixed;
    }
    return "";
  }

  if (allowShort && fixed.length >= 7 && fixed.length < 17) {
    if (/^[A-HJ-NPR-Z0-9]{7,16}$/.test(fixed) && rawDigitCount >= 2 && fixedDigitCount >= 3) {
      return fixed;
    }
  }

  return "";
}

// extract a bmw or rolls-royce (or general 17-char / labeled 7-char) vin from ocr text
function extractAndCleanVin(rawText) {
  const result = {
    vin: "",
    matchedTokens: []
  };
  if (!rawText || rawText.trim() === "") {
    return result;
  }

  let fallback17 = "";
  let labeledShort = "";

  // check explicit vin labels first (supports hyphenated vins and 7-char awp short vins)
  const labeledRegex = /\bvin\s*(?:no\.?|num\.?|number|#)?\s*[:#=\-\u2013\u2014]*\s*([A-Z0-9]{3,}(?:[-][A-Z0-9]{2,})*)/gi;
  let labeledMatch = labeledRegex.exec(rawText);
  while (labeledMatch !== null) {
    const rawCandidate = labeledMatch[1];
    const clean17 = normalizeVinCandidate(rawCandidate, false);
    if (clean17 !== "") {
      result.matchedTokens.push(rawCandidate);
      const prefix = clean17.slice(0, 3);
      if (KNOWN_VIN_PREFIXES.indexOf(prefix) !== -1) {
        result.vin = clean17;
        return result;
      }
      if (fallback17 === "") {
        fallback17 = clean17;
      }
    } else {
      const cleanShort = normalizeVinCandidate(rawCandidate, true);
      if (cleanShort !== "" && labeledShort === "") {
        result.matchedTokens.push(rawCandidate);
        labeledShort = cleanShort;
      }
    }
    labeledMatch = labeledRegex.exec(rawText);
  }

  // scan all standalone 17-character alphanumeric tokens (including ocr I/O/Q mistakes)
  const tokenRegex = /\b([A-Za-z0-9]{17})\b/g;
  let tokenMatch = tokenRegex.exec(rawText);
  while (tokenMatch !== null) {
    const rawToken = tokenMatch[1];
    const cleaned = normalizeVinCandidate(rawToken, false);
    if (cleaned !== "") {
      result.matchedTokens.push(rawToken);
      const prefix = cleaned.slice(0, 3);
      if (KNOWN_VIN_PREFIXES.indexOf(prefix) !== -1) {
        result.vin = cleaned;
        return result;
      }
      if (fallback17 === "") {
        fallback17 = cleaned;
      }
    }
    tokenMatch = tokenRegex.exec(rawText);
  }

  if (fallback17 !== "") {
    result.vin = fallback17;
    return result;
  }

  if (labeledShort !== "") {
    result.vin = labeledShort;
  }

  return result;
}

// normalize a variable-length customer # token (3-10 digits, preserves internal dashes, strips #, brackets, spaces)
function cleanCustomerNumberToken(rawToken) {
  if (!rawToken) {
    return "";
  }

  let cleaned = String(rawToken)
    .replace(/[#\s()[\],.:]+/g, "")
    .replace(/[\u2013\u2014]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!/^[0-9]+(?:-[0-9]+)*$/.test(cleaned)) {
    return "";
  }

  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length < 3 || digitsOnly.length > 10) {
    return "";
  }

  return cleaned;
}

// verify a candidate customer # isn't a standalone 4-digit car model year unless explicitly wrapped or labeled
function isAcceptableCustomerNumber(rawWithWrapper, explicitContext) {
  const cleaned = cleanCustomerNumberToken(rawWithWrapper);
  if (cleaned === "") {
    return false;
  }

  const hasMarker = /[#(\[\]]/.test(String(rawWithWrapper));
  if (!explicitContext && !hasMarker && /^\d{4}$/.test(cleaned)) {
    const yearNum = parseInt(cleaned, 10);
    if (yearNum >= 1990 && yearNum <= 2035) {
      return false;
    }
  }

  return true;
}

// reject vehicle labels, street addresses, and crm column headers mistaken for a customer name
function isNonCustomerNameText(text) {
  return NON_NAME_WORD_REGEX.test(text);
}

// clean up all-caps names from tekion (e.g. SMITH, JOHN -> John Smith)
function normalizeCustomerName(rawName) {
  let cleaned = rawName.replace(/\s+/g, " ").trim();
  // remove trailing punctuation and brackets left after stripping customer #
  cleaned = cleaned.replace(/[\s\-–—,#(\[\]:]+$/g, "").replace(/^[\s\-–—,#)\]\]:]+/g, "").trim();
  if (cleaned === "") {
    return "";
  }

  // handle "LAST, FIRST" format
  const commaParts = cleaned.split(",");
  if (commaParts.length === 2) {
    const lastPart = commaParts[0].trim();
    const firstPart = commaParts[1].trim();
    if (firstPart !== "" && lastPart !== "") {
      cleaned = firstPart + " " + lastPart;
    }
  }

  // convert pure uppercase or pure lowercase names to title case
  const isAllUpper = cleaned === cleaned.toUpperCase();
  const isAllLower = cleaned === cleaned.toLowerCase();
  if (isAllUpper || isAllLower) {
    const words = cleaned.split(" ");
    const titled = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 0) {
        titled.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      }
    }
    return titled.join(" ");
  }

  return cleaned;
}

// separate a variable-length customer number (with optional dashes, brackets, or #) attached to the customer's name
function splitNameAndCustomerNumber(rawInput) {
  const result = {
    name: "",
    customerNumber: ""
  };
  if (!rawInput || rawInput.trim() === "") {
    return result;
  }

  const text = rawInput.replace(/\s+/g, " ").trim();

  // case 1: trailing customer # (e.g. "John Smith (4829)", "Jane Doe [48-2910]", "SMITH, JOHN - 12345678", "John Smith482910")
  const trailingMatch = text.match(/^(.*?[A-Za-z])[,\s:\-\u2013\u2014]*([#(\[]*\s*\d+(?:[\-\u2013\u2014]\d+)*\s*[)\]]*)$/);
  if (trailingMatch) {
    const candidateName = trailingMatch[1];
    const rawNum = trailingMatch[2];
    const cleanNum = cleanCustomerNumberToken(rawNum);
    if (/[A-Za-z]{2}/.test(candidateName) && !isNonCustomerNameText(candidateName) && isAcceptableCustomerNumber(rawNum, false)) {
      result.name = normalizeCustomerName(candidateName);
      result.customerNumber = cleanNum;
      return result;
    }
  }

  // case 2: leading customer # (e.g. "#9821 Alex Brown", "(482910) John Smith", "[48-2910] - Jane Doe")
  const leadingMatch = text.match(/^([#(\[]*\s*\d+(?:[\-\u2013\u2014]\d+)*\s*[)\]]*)[,\s:\-\u2013\u2014]+([A-Za-z][A-Za-z\s.,'-]+)$/);
  if (leadingMatch) {
    const rawNum = leadingMatch[1];
    const candidateName = leadingMatch[2];
    const cleanNum = cleanCustomerNumberToken(rawNum);
    if (/[A-Za-z]{2}/.test(candidateName) && !isNonCustomerNameText(candidateName) && isAcceptableCustomerNumber(rawNum, false)) {
      result.name = normalizeCustomerName(candidateName);
      result.customerNumber = cleanNum;
      return result;
    }
  }

  // case 3: inline "Name [482910] | Active" with extra ocr columns/labels afterward on the same line
  const inlineMatch = text.match(/^([A-Za-z][A-Za-z\s.,'-]{1,40}?)(?:[,\s:\-\u2013\u2014]+|(?=[#(\[]))([#(\[]*\s*\d+(?:[\-\u2013\u2014]\d+)*\s*[)\]]*)(?=$|[\s|;,:])/);
  if (inlineMatch) {
    const candidateName = inlineMatch[1];
    const rawNum = inlineMatch[2];
    const cleanNum = cleanCustomerNumberToken(rawNum);
    if (/[A-Za-z]{2}/.test(candidateName) && !isNonCustomerNameText(candidateName) && isAcceptableCustomerNumber(rawNum, false)) {
      result.name = normalizeCustomerName(candidateName);
      result.customerNumber = cleanNum;
      return result;
    }
  }

  result.name = normalizeCustomerName(text);
  return result;
}

// format raw, dashed, dotted, or bracketed phone numbers into XXX-XXX-XXXX
function formatPhoneNumber(rawPhone) {
  if (!rawPhone) {
    return "";
  }
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 11 && digits.charAt(0) === "1") {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && digits.charAt(0) >= "2") {
    return digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
  }
  return "";
}

// find the first phone match in pasted or ocr text and return formatted value + raw token
function extractPhoneFromText(rawText) {
  const match = rawText.match(PHONE_EXTRACT_REGEX);
  if (!match) {
    return null;
  }
  const formatted = formatPhoneNumber(match[1]);
  if (formatted === "") {
    return null;
  }
  return {
    formatted: formatted,
    rawToken: match[1]
  };
}

// pull out the vin, phone, customer #, and name from ocr or pasted tekion text
function parseTekionOrAwpText(rawText) {
  if (!rawText || rawText.trim() === "") {
    showToast("no text found to parse.");
    return;
  }

  let matchedCount = 0;
  let foundName = "";
  let foundCustNum = "";
  const vinInfo = extractAndCleanVin(rawText);
  const filledVin = vinInfo.vin;

  if (filledVin !== "") {
    const vinInput = document.getElementById("customer-vin");
    const vinHelper = document.getElementById("vin-helper-text");
    if (vinInput) {
      vinInput.value = filledVin;
      matchedCount = matchedCount + 1;
    }
    if (vinHelper) {
      vinHelper.textContent = "awp last 7 digits: " + extractLast7Vin(filledVin);
    }
  }

  // look for a 10-digit phone number (raw digits, dashes, dots, spaces, or brackets)
  const phoneInfo = extractPhoneFromText(rawText);
  if (phoneInfo) {
    const phoneInput = document.getElementById("customer-phone");
    if (phoneInput) {
      phoneInput.value = phoneInfo.formatted;
      matchedCount = matchedCount + 1;
    }
  }

  // strip already-detected phones, vins (including ocr-corrected tokens), and emails so they don't confuse name/id matching
  let scrubbedText = rawText
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\b[A-HJ-NPR-Z0-9]{17}\b/gi, " ")
    .replace(PHONE_SCRUB_REGEX, " ");

  for (let v = 0; v < vinInfo.matchedTokens.length; v++) {
    const rawVinToken = vinInfo.matchedTokens[v];
    if (rawVinToken) {
      scrubbedText = scrubbedText.split(rawVinToken).join(" ");
    }
  }

  // look for explicit customer number label (allows 3-10 digits, brackets, hyphens, #)
  const custNumRegex = /(?:customer\s*(?:id|no\.?|num\.?|number|#)|cust\s*(?:id|no\.?|num\.?|number|#)|account\s*(?:id|no\.?|num\.?|number|#)|client\s*(?:id|no\.?|#))[ \t]*[:#=\-\u2013\u2014]*[ \t]*([#(\[]*[ \t]*\d+(?:[\-\u2013\u2014]\d+)*[ \t]*[)\]]*)/i;
  const custNumMatch = scrubbedText.match(custNumRegex);
  if (custNumMatch && isAcceptableCustomerNumber(custNumMatch[1], true)) {
    foundCustNum = cleanCustomerNumberToken(custNumMatch[1]);
  }

  // check labeled customer name first and split out any attached variable-length customer #
  const nameRegex = /(?:customer\s*name|client\s*name|(?:customer|client)(?!\s*(?:id|no|num|number|#))|name)[ \t]*[:#-]+[ \t]*([^\r\n]+)/i;
  const nameMatch = scrubbedText.match(nameRegex);
  if (nameMatch) {
    const splitLabeled = splitNameAndCustomerNumber(nameMatch[1]);
    if (splitLabeled.name !== "" && !isNonCustomerNameText(splitLabeled.name)) {
      foundName = splitLabeled.name;
    }
    if (splitLabeled.customerNumber !== "" && foundCustNum === "") {
      foundCustNum = splitLabeled.customerNumber;
    }
  }

  // fallback: scan lines/columns for tekion/awp header format like "John Smith (4829)" or "SMITH, JOHN [48-2910]"
  if (foundName === "" || foundCustNum === "") {
    const lines = scrubbedText.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const segments = lines[i].split(/[|\t•]+/);
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s].trim();
        if (seg === "") {
          continue;
        }
        if (/\b(ave|avenue|st|street|rd|road|blvd|drive|dr|way|lane|ln|hwy|suite|unit|apt|vin|phone|tel|cell|fax|odometer|mileage)\b/i.test(seg)) {
          continue;
        }
        const segSplit = splitNameAndCustomerNumber(seg);
        if (segSplit.name !== "" && segSplit.customerNumber !== "") {
          const wordCount = segSplit.name.split(/\s+/).length;
          if (wordCount >= 1 && wordCount <= 4) {
            if (foundName === "") {
              foundName = segSplit.name;
            }
            if (foundCustNum === "") {
              foundCustNum = segSplit.customerNumber;
            }
            break;
          }
        }
      }
      if (foundName !== "" && foundCustNum !== "") {
        break;
      }
    }
  }

  // fallback: check bracketed or #-prefixed customer numbers first, then standalone 3-10 digit tokens
  if (foundCustNum === "") {
    const markedIdRegex = /(\(\s*\d+(?:[\-\u2013\u2014]\d+)*\s*\)|\[\s*\d+(?:[\-\u2013\u2014]\d+)*\s*\]|#\s*\d+(?:[\-\u2013\u2014]\d+)*)/g;
    let markedMatch = markedIdRegex.exec(scrubbedText);
    while (markedMatch !== null) {
      if (isAcceptableCustomerNumber(markedMatch[1], false)) {
        foundCustNum = cleanCustomerNumberToken(markedMatch[1]);
        break;
      }
      markedMatch = markedIdRegex.exec(scrubbedText);
    }
  }

  if (foundCustNum === "") {
    const looseIdRegex = /\b(\d+(?:[\-\u2013\u2014]\d+)*)\b/g;
    let looseMatch = looseIdRegex.exec(scrubbedText);
    while (looseMatch !== null) {
      const trailingTail = scrubbedText.slice(looseMatch.index + looseMatch[0].length, looseMatch.index + looseMatch[0].length + 20);
      const isMeasurementOrStreet = /^[ \t]*(?:km|mi|miles|ave|avenue|st|street|rd|road|blvd|drive|dr)\b/i.test(trailingTail);
      if (!isMeasurementOrStreet && isAcceptableCustomerNumber(looseMatch[1], false)) {
        foundCustNum = cleanCustomerNumberToken(looseMatch[1]);
        break;
      }
      looseMatch = looseIdRegex.exec(scrubbedText);
    }
  }

  if (foundName !== "") {
    const nameInput = document.getElementById("customer-name");
    if (nameInput) {
      nameInput.value = foundName;
      matchedCount = matchedCount + 1;
    }
  }

  if (foundCustNum !== "") {
    const custInput = document.getElementById("customer-number");
    if (custInput) {
      custInput.value = foundCustNum;
      matchedCount = matchedCount + 1;
    }
  }

  updateEmailPreview();
  showToast("auto-filled " + matchedCount + " field(s) from pasted info.");
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
      statusText.textContent = "screenshot attached! auto-scanning with ocr...";
    }
    showToast("screenshot pasted - running auto-ocr...");
    runScreenshotOcr();
  };
  reader.readAsDataURL(blob);
}

// upscale small tekion snips and boost contrast so tesseract reads numbers and vins accurately
function preprocessImageForOcr(dataUrl) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () {
      try {
        let scale = 1;
        if (img.width < 1200) {
          scale = 2;
        }
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessTotal = 0;
        for (let i = 0; i < data.length; i = i + 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          brightnessTotal = brightnessTotal + gray;
        }
        const pixelCount = data.length / 4;
        const avgBrightness = brightnessTotal / pixelCount;
        // invert dark-mode screenshots so tesseract always reads dark text on a light background
        const isDarkBackground = avgBrightness < 115;

        for (let i = 0; i < data.length; i = i + 4) {
          let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (isDarkBackground) {
            gray = 255 - gray;
          }
          // gentle contrast stretch around midpoint 128
          let contrasted = (gray - 128) * 1.45 + 128;
          if (contrasted < 0) {
            contrasted = 0;
          }
          if (contrasted > 255) {
            contrasted = 255;
          }
          data[i] = contrasted;
          data[i + 1] = contrasted;
          data[i + 2] = contrasted;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        resolve(dataUrl);
      }
    };
    img.onerror = function () {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
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
    const enhancedUrl = await preprocessImageForOcr(appState.screenshotDataUrl);
    const result = await window.Tesseract.recognize(enhancedUrl, "eng");
    const extractedText = result.data.text;
    parseTekionOrAwpText(extractedText);
    if (statusText) {
      statusText.textContent = "ocr done — verify fields below.";
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

// reset the screenshot box and action buttons
function clearScreenshotPreview(statusMessage) {
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
    statusText.textContent = statusMessage;
  }
}

// wipe the form clean when the next customer calls in
function resetCallForm() {
  const fieldIds = [
    "customer-name",
    "customer-phone",
    "customer-number",
    "customer-vin",
    "custom-notes"
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

  clearScreenshotPreview("waiting for paste (ctrl+v)...");

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
  if (appState.advisors.length > 0) {
    selectAdvisorByIndex(0);
  } else {
    renderAdvisorPills();
  }
  renderSettingsAdvisorList();
  renderCcPills();
  renderSettingsCcList();

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
    "cc-email-input",
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
        if (liveFieldIds[i] === "cc-email-input") {
          renderCcPills();
        }
        updateEmailPreview();
      });
    }
  }

  // auto-split variable-length customer # when pasted or typed onto the customer name box
  const customerNameInput = document.getElementById("customer-name");
  if (customerNameInput) {
    const splitNameField = function () {
      const parsed = splitNameAndCustomerNumber(customerNameInput.value);
      if (parsed.customerNumber !== "") {
        customerNameInput.value = parsed.name;
        const custNumEl = document.getElementById("customer-number");
        if (custNumEl) {
          custNumEl.value = parsed.customerNumber;
        }
        updateEmailPreview();
        showToast("isolated customer # " + parsed.customerNumber + " from name.");
      }
    };
    customerNameInput.addEventListener("blur", splitNameField);
    customerNameInput.addEventListener("paste", function () {
      setTimeout(splitNameField, 0);
    });
  }

  // clean brackets, spaces, or # pasted directly into the customer # box
  const customerNumberInput = document.getElementById("customer-number");
  if (customerNumberInput) {
    const normalizeCustomerNumberField = function () {
      const cleaned = cleanCustomerNumberToken(customerNumberInput.value);
      if (cleaned !== "") {
        customerNumberInput.value = cleaned;
        updateEmailPreview();
      }
    };
    customerNumberInput.addEventListener("blur", normalizeCustomerNumberField);
    customerNumberInput.addEventListener("paste", function () {
      setTimeout(normalizeCustomerNumberField, 0);
    });
  }

  // auto-format raw or bracketed phone numbers typed or pasted into phone box
  const customerPhoneInput = document.getElementById("customer-phone");
  if (customerPhoneInput) {
    const normalizePhoneField = function () {
      const formatted = formatPhoneNumber(customerPhoneInput.value);
      if (formatted !== "") {
        customerPhoneInput.value = formatted;
        updateEmailPreview();
      }
    };
    customerPhoneInput.addEventListener("blur", normalizePhoneField);
    customerPhoneInput.addEventListener("paste", function () {
      setTimeout(normalizePhoneField, 0);
    });
  }

  // clean up hyphens/spaces/ocr lookalikes pasted into the vin box
  const customerVinInput = document.getElementById("customer-vin");
  if (customerVinInput) {
    const normalizeVinField = function () {
      const cleaned = normalizeVinCandidate(customerVinInput.value, true);
      if (cleaned !== "") {
        customerVinInput.value = cleaned;
        const helper = document.getElementById("vin-helper-text");
        if (helper) {
          helper.textContent = "awp last 7 digits: " + extractLast7Vin(cleaned);
        }
        updateEmailPreview();
      }
    };
    customerVinInput.addEventListener("blur", normalizeVinField);
    customerVinInput.addEventListener("paste", function () {
      setTimeout(normalizeVinField, 0);
    });
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

  // listen for ctrl+v anywhere on the page to grab screenshots or pasted tekion text
  window.addEventListener("paste", function (event) {
    if (!event.clipboardData) {
      return;
    }
    const items = event.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          handleScreenshotBlob(blob);
          event.preventDefault();
          return;
        }
      }
    }

    // if pasting plain text outside an input box, extract customer fields right away
    const activeEl = document.activeElement;
    let isTypingField = false;
    if (activeEl) {
      const tag = activeEl.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        isTypingField = true;
      }
    }
    if (!isTypingField) {
      const pastedText = event.clipboardData.getData("text/plain");
      if (pastedText && pastedText.trim() !== "") {
        parseTekionOrAwpText(pastedText);
        event.preventDefault();
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
      clearScreenshotPreview("screenshot removed.");
    });
  }

  // buttons for copying advisor email, cc, subject line, body, and opening mailto
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

  const copyCcBtn = document.getElementById("copy-cc-btn");
  if (copyCcBtn) {
    copyCcBtn.addEventListener("click", async function () {
      const ccEl = document.getElementById("preview-cc");
      if (ccEl && ccEl.value.trim() !== "") {
        await navigator.clipboard.writeText(ccEl.value.trim());
        showToast("copied cc email address(es).");
      } else {
        showToast("no cc emails entered.");
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
      const ccEl = document.getElementById("preview-cc");
      const subjEl = document.getElementById("preview-subject");
      const bodyEl = document.getElementById("preview-body");

      let toAddr = "";
      if (toEl) {
        toAddr = toEl.value.trim();
      }
      let ccAddr = "";
      if (ccEl) {
        ccAddr = ccEl.value.trim();
      }
      let subject = "";
      if (subjEl) {
        subject = encodeURIComponent(subjEl.value);
      }
      let body = "";
      if (bodyEl) {
        body = encodeURIComponent(bodyEl.value);
      }

      let mailtoUrl = "mailto:" + toAddr + "?subject=" + subject + "&body=" + body;
      if (ccAddr !== "") {
        mailtoUrl = mailtoUrl + "&cc=" + encodeURIComponent(ccAddr);
      }

      window.location.href = mailtoUrl;
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
        themeToggleBtn.textContent = "light mode";
        localStorage.setItem(STORAGE_KEYS.THEME, "dark");
      } else {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "dark mode";
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

  // add a new quick cc contact to my saved list
  const addCcBtn = document.getElementById("add-cc-btn");
  if (addCcBtn) {
    addCcBtn.addEventListener("click", function () {
      const nameEl = document.getElementById("new-cc-name");
      const emailEl = document.getElementById("new-cc-email");
      if (!nameEl || !emailEl) {
        return;
      }
      const nameVal = nameEl.value.trim();
      const emailVal = emailEl.value.trim();
      if (nameVal === "" || emailVal === "") {
        showToast("enter both cc label and email.");
        return;
      }
      appState.ccContacts.push({ name: nameVal, email: emailVal });
      nameEl.value = "";
      emailEl.value = "";
      saveSettingsToStorage();
      renderCcPills();
      renderSettingsCcList();
      showToast("added cc contact " + nameVal + ".");
    });
  }

  // export portable advisors.json backup file
  const exportConfigBtn = document.getElementById("export-config-btn");
  if (exportConfigBtn) {
    exportConfigBtn.addEventListener("click", function () {
      const payload = JSON.stringify(buildConfigPayload(), null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "advisors.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("exported advisors.json config file.");
    });
  }

  // save portable advisors-config.js directly to usb for direct file:// index.html fallback
  const exportJsConfigBtn = document.getElementById("export-js-config-btn");
  if (exportJsConfigBtn) {
    exportJsConfigBtn.addEventListener("click", async function () {
      const jsContent = "// portable usb config loaded directly when double-clicking index.html over file://\r\n" +
        "window.USB_SAVED_CONFIG = " + JSON.stringify(buildConfigPayload(), null, 2) + ";\r\n";

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: "advisors-config.js",
            types: [{ description: "JavaScript Config", accept: { "application/javascript": [".js"] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(jsContent);
          await writable.close();
          showToast("saved advisors-config.js directly!");
          return;
        } catch (err) {
          if (err && err.name === "AbortError") {
            return;
          }
        }
      }

      const blob = new Blob([jsContent], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "advisors-config.js";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("downloaded advisors-config.js — copy it to your usb folder.");
    });
  }

  // import portable advisors.json backup file
  const importConfigInput = document.getElementById("import-config-input");
  if (importConfigInput) {
    importConfigInput.addEventListener("change", function (event) {
      if (!event.target.files || !event.target.files[0]) {
        return;
      }
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        try {
          const parsed = JSON.parse(loadEvent.target.result);
          if (applyConfigObject(parsed)) {
            if (sigInput) {
              sigInput.value = appState.signature;
            }
            saveSettingsToStorage();
            renderAdvisorPills();
            renderSettingsAdvisorList();
            renderCcPills();
            renderSettingsCcList();
            updateEmailPreview();
            showToast("imported portable config successfully.");
          }
        } catch (err) {
          showToast("could not parse json config file.");
        }
        importConfigInput.value = "";
      };
      reader.readAsText(file);
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
  syncConfigFromUsbServer();
}

document.addEventListener("DOMContentLoaded", initializeDashboardEvents);
