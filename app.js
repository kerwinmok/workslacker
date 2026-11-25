// keys i use to save my settings in browser localstorage
const STORAGE_KEYS = {
  ADVISORS: "bmw_service_advisors_v1",
  CC_LIST: "bmw_service_cc_v1",
  SIGNATURE: "bmw_service_signature_v1",
  THEME: "bmw_service_theme_v1",
  TEMPLATES: "bmw_service_templates_v1",
  SERVICES: "bmw_service_services_v1",
  CATEGORIES: "bmw_service_categories_v1"
};

// starter list of advisors and managers before i customize them in settings
const DEFAULT_ADVISORS = [
  { name: "David Kung", email: "" },
  { name: "Ken Chao", email: "" },
  { name: "Philip Chen", email: "" },
  { name: "Kreig Barker", email: "" },
  { name: "Jack Pagtalunan", email: "" },
  { name: "Quentin Pink", email: "" },
  { name: "Jason Mah", email: "" },
  { name: "Jason Tabo", email: "" },
  { name: "Martyn Marsh", email: "" },
  { name: "Andrew McKinnon", email: "" }
];

// starter list of quick cc contacts
const DEFAULT_CC_LIST = [
  { name: "Service Dispatch", email: "dispatch@thebmwstore.ca" },
  { name: "BDC / Appointments", email: "appointments@thebmwstore.ca" }
];

// my default email sign-off (empty by default since outlook already appends my signature)
const DEFAULT_SIGNATURE = "";

const DEFAULT_SERVICES = [
  { name: "Oil Service", category: "Oil Change" },
  { name: "Brake Fluid Flush", category: "Maintenance" },
  { name: "Cabin Microfilter", category: "Maintenance" },
  { name: "Engine Air Filter", category: "Maintenance" },
  { name: "Vehicle Check Inspection", category: "Maintenance" },
  { name: "Front Brakes (Pads & Rotors)", category: "Brakes" },
  { name: "Rear Brakes (Pads & Rotors)", category: "Brakes" },
  { name: "Four-Wheel Alignment", category: "Maintenance" },
  { name: "Seasonal Tire Swap", category: "Tires" },
  { name: "Spark Plugs Replacement", category: "Maintenance" },
  { name: "Coolant Flush", category: "Maintenance" },
  { name: "12V Battery Replacement", category: "Electrical" },
  { name: "Warning Light / Diagnostics", category: "Diagnostics" }
];

const DEFAULT_CATEGORIES = ["Price Quote", "Oil Change", "Status Update", "Callback", "Maintenance", "Brakes", "Tires", "Diagnostics", "Electrical", "Customer Concern", "Other"];

const DEFAULT_TEMPLATES = [
  {
    id: "quote-standard",
    mode: "quote",
    name: "Standard Quote",
    subject: "PRICE QUOTE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please provide a price quote for the request below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "quote-maintenance",
    mode: "quote",
    name: "Oil / Maintenance",
    subject: "PRICE QUOTE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please provide a price quote and availability for the maintenance service below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "quote-brakes-tires",
    mode: "quote",
    name: "Brakes / Tires",
    subject: "PRICE QUOTE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please provide a parts and labor quote for the brake/tire request below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "status-general",
    mode: "status",
    name: "General Status",
    subject: "STATUS UPDATE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please provide a status update for the customer below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "status-ready",
    mode: "status",
    name: "Ready for Pickup?",
    subject: "STATUS UPDATE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nThe customer below called to check if their vehicle is ready for pickup. Could you please provide an update?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "status-eta",
    mode: "status",
    name: "Parts / Repair ETA",
    subject: "STATUS UPDATE: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nThe customer below is asking for an updated ETA on parts/repairs. Could you please advise?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "callback-standard",
    mode: "callback",
    name: "Standard Callback",
    subject: "CALLBACK: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please give the customer below a call back?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "callback-urgent",
    mode: "callback",
    name: "Urgent Callback",
    subject: "CALLBACK: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nThe customer below requested a callback as soon as possible regarding the issue below.\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  },
  {
    id: "callback-booking",
    mode: "callback",
    name: "Follow-Up / Booking",
    subject: "CALLBACK: {{customerAndNumber}}",
    body: "Hello {{advisorName}},\n\nCould you please call the customer below back to follow up or schedule their appointment?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nProblem / Service: {{serviceDetails}}\n\n{{signature}}"
  }
];

function inferTemplateMode(template) {
  if (!template) return "quote";
  const rawMode = String(template.mode || "").toLowerCase();
  if (rawMode === "quote" || rawMode === "status" || rawMode === "callback") {
    return rawMode;
  }
  const hint = (String(template.category || "") + " " + String(template.name || "") + " " + String(template.id || "")).toLowerCase();
  if (hint.indexOf("status") !== -1) return "status";
  if (hint.indexOf("callback") !== -1 || hint.indexOf("call back") !== -1) return "callback";
  return "quote";
}

function formatModeLabel(mode) {
  if (mode === "status") return "Status Update";
  if (mode === "callback") return "Callback";
  return "Price Quote";
}

function isLegacyBundledTemplates(list) {
  if (!Array.isArray(list) || list.length !== 4) return false;
  const legacyIds = ["price-quote", "oil-change", "status-update", "callback"];
  for (let i = 0; i < list.length; i++) {
    if (!list[i] || legacyIds.indexOf(list[i].id) === -1) return false;
  }
  return true;
}

function normalizeLoadedTemplates(list) {
  return list.filter(function (item) {
    return item && typeof item.id === "string" && typeof item.name === "string" && typeof item.subject === "string" && typeof item.body === "string";
  }).map(function (item) {
    return Object.assign({}, item, { mode: inferTemplateMode(item) });
  });
}

// shared vin prefixes (bmw, mini, and rolls-royce) and text parsing regexes
const KNOWN_VIN_PREFIXES = ["WBA", "WBS", "WBY", "WBW", "WBX", "WMW", "WMZ", "5UX", "5YM", "5UM", "3MW", "3MF", "4US", "SCA", "SBA", "SCB", "SLA"];
const NON_NAME_WORD_REGEX = /\b(ave|avenue|st|street|rd|road|blvd|drive|dr|hwy|suite|unit|apt|bmw|rolls|royce|ghost|phantom|cullinan|spectre|wraith|dawn|mini|cooper|countryman|clubman|paceman|jcw|hardtop|convertible|aceman|tekion|awp|customer|client|odometer|mileage|km|mi|status|active|inactive|pending|service|appointment|advisor|vin|ro|repair|order|year|model|vehicle|plate|license|invoiced|drop|off|dropoff|loaner|tech|assigned|notes|tag|notify|again|cancel|reschedule|edit|upcoming|last|visit|email|phone|door|sedan|coupe|suv|gran|touring|xdrive|sdrive|electric|hybrid|waiter|shuttle|valet)\b/i;
const PHONE_EXTRACT_REGEX = /(?:^|[^0-9A-Za-z])((?:\+?1[-.\s\u2013\u2014]*)?[\[(]?[2-9][0-9]{2}[\])]?[-.\s\u2013\u2014]*[0-9]{3}[-.\s\u2013\u2014]*[0-9]{4})(?![0-9])/;
const PHONE_SCRUB_REGEX = /(^|[^0-9A-Za-z])(?:\+?1[-.\s\u2013\u2014]*)?[\[(]?[2-9][0-9]{2}[\])]?[-.\s\u2013\u2014]*[0-9]{3}[-.\s\u2013\u2014]*[0-9]{4}(?![0-9])/g;

// keeps track of what i currently have selected on the screen
const appState = {
  mode: "quote",
  advisors: [],
  ccContacts: [],
  selectedCcEmails: [],
  selectedAdvisorIndex: -1,
  selectedServices: [],
  services: DEFAULT_SERVICES.slice(),
  categories: DEFAULT_CATEGORIES.slice(),
  templates: DEFAULT_TEMPLATES.map(function (template) { return Object.assign({}, template); }),
  activeTemplateId: "",
  previewEdited: false,
  editingTemplateId: "",
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
    signature: appState.signature,
    services: appState.services,
    categories: appState.categories,
    templates: appState.templates
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
  if (typeof cfg.signature === "string") {
    appState.signature = cfg.signature;
  }
  if (Array.isArray(cfg.services)) {
    appState.services = cfg.services.filter(function (item) {
      return item && typeof item.name === "string" && typeof item.category === "string";
    });
  }
  if (Array.isArray(cfg.categories)) appState.categories = cfg.categories.filter(function (item) { return typeof item === "string"; });
  if (Array.isArray(cfg.templates) && cfg.templates.length > 0) {
    const normalized = normalizeLoadedTemplates(cfg.templates);
    if (normalized.length > 0 && !isLegacyBundledTemplates(normalized)) {
      appState.templates = normalized;
    }
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
  if (savedSignature !== null) {
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

  [["TEMPLATES", "templates"], ["SERVICES", "services"], ["CATEGORIES", "categories"]].forEach(function (keyPair) {
    const raw = localStorage.getItem(STORAGE_KEYS[keyPair[0]]);
    if (!raw) return;
    try {
      const value = JSON.parse(raw);
      if (Array.isArray(value)) {
        if (keyPair[1] === "services") {
          appState.services = value.filter(function (item) { return item && typeof item.name === "string" && typeof item.category === "string"; });
        } else if (keyPair[1] === "templates") {
          const normalized = normalizeLoadedTemplates(value);
          if (normalized.length > 0 && !isLegacyBundledTemplates(normalized)) {
            appState.templates = normalized;
          }
        } else {
          appState.categories = value.filter(function (item) { return typeof item === "string"; });
        }
      }
    } catch (err) {
      // keep the bundled defaults
    }
  });
}

// select an advisor by index and populate the advisor name field
function selectAdvisorByIndex(idx) {
  if (idx < 0 || idx >= appState.advisors.length) {
    return;
  }
  const advisor = appState.advisors[idx];
  appState.selectedAdvisorIndex = idx;
  const nameInput = document.getElementById("advisor-name-input");
  if (nameInput) {
    nameInput.value = advisor.name;
  }
  renderAdvisorPills();
  updateEmailPreview();
}

// add a new advisor (or select it if already present) and persist to storage/usb
function addOrSelectAdvisorByName(rawName) {
  const trimmed = String(rawName || "").trim();
  if (trimmed === "") {
    showToast("enter advisor name.");
    return false;
  }

  const existingIdx = appState.advisors.findIndex(function (item) {
    return item && item.name && item.name.toLowerCase() === trimmed.toLowerCase();
  });
  if (existingIdx !== -1) {
    selectAdvisorByIndex(existingIdx);
    showToast("selected advisor " + appState.advisors[existingIdx].name + ".");
    return true;
  }

  appState.advisors.push({ name: trimmed, email: "" });
  appState.selectedAdvisorIndex = appState.advisors.length - 1;
  const nameInput = document.getElementById("advisor-name-input");
  if (nameInput) {
    nameInput.value = trimmed;
  }
  saveSettingsToStorage();
  renderAdvisorPills();
  renderSettingsAdvisorList();
  updateEmailPreview();
  showToast("added advisor " + trimmed + ".");
  return true;
}

// remove an advisor by index, update selection, and persist to storage/usb
function removeAdvisorAtIndex(idx) {
  if (idx < 0 || idx >= appState.advisors.length) {
    return;
  }
  const removed = appState.advisors.splice(idx, 1)[0];
  if (appState.selectedAdvisorIndex === idx) {
    if (appState.advisors.length > 0) {
      appState.selectedAdvisorIndex = Math.min(idx, appState.advisors.length - 1);
      const nameInput = document.getElementById("advisor-name-input");
      if (nameInput) {
        nameInput.value = appState.advisors[appState.selectedAdvisorIndex].name;
      }
    } else {
      appState.selectedAdvisorIndex = -1;
      const nameInput = document.getElementById("advisor-name-input");
      if (nameInput) {
        nameInput.value = "";
      }
    }
  } else if (appState.selectedAdvisorIndex > idx) {
    appState.selectedAdvisorIndex = appState.selectedAdvisorIndex - 1;
  }
  saveSettingsToStorage();
  renderAdvisorPills();
  renderSettingsAdvisorList();
  updateEmailPreview();
  showToast("removed advisor " + (removed ? removed.name : "") + ".");
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
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(appState.templates));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(appState.services));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(appState.categories));

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
      renderTemplateManagement();
      renderServiceManagement();
      updateEmailPreview();
      setUsbSyncStatus("connected — advisors and templates auto-save to advisors.json.");
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
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(appState.templates));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(appState.services));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(appState.categories));
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

// build the advisor pills with quick select and inline remove
function renderAdvisorPills() {
  const container = document.getElementById("advisor-pills");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  for (let i = 0; i < appState.advisors.length; i++) {
    const advisor = appState.advisors[i];
    const pill = document.createElement("div");
    pill.className = "chip advisor-chip";
    if (i === appState.selectedAdvisorIndex) {
      pill.classList.add("active");
    }

    const nameBtn = document.createElement("button");
    nameBtn.type = "button";
    nameBtn.className = "chip-name-btn";
    nameBtn.textContent = advisor.name;
    nameBtn.addEventListener("click", function () {
      selectAdvisorByIndex(i);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chip-remove-btn";
    removeBtn.textContent = "\u00d7";
    removeBtn.title = "remove " + advisor.name;
    removeBtn.setAttribute("aria-label", "remove " + advisor.name);
    removeBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      removeAdvisorAtIndex(i);
    });

    pill.appendChild(nameBtn);
    pill.appendChild(removeBtn);
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
    infoSpan.textContent = advisor.name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger";
    removeBtn.textContent = "remove";
    removeBtn.addEventListener("click", function () {
      removeAdvisorAtIndex(i);
    });

    row.appendChild(infoSpan);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
  }
}

function renderServiceChips() {
  const container = document.getElementById("service-chips");
  const query = (document.getElementById("service-search") || {}).value || "";
  if (!container) return;
  container.innerHTML = "";
  appState.services.filter(function (service) {
    return service.name.toLowerCase().includes(query.trim().toLowerCase());
  }).forEach(function (service) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip service-chip";
    button.textContent = service.name;
    button.title = service.category || "service";
    if (appState.selectedServices.includes(service.name)) button.classList.add("active");
    button.addEventListener("click", function () {
      const index = appState.selectedServices.indexOf(service.name);
      if (index === -1) appState.selectedServices.push(service.name);
      else appState.selectedServices.splice(index, 1);
      button.classList.toggle("active", index === -1);
      updateEmailPreview();
    });
    container.appendChild(button);
  });
}

function getTemplatesForMode(mode) {
  const targetMode = mode || appState.mode || "quote";
  return appState.templates.filter(function (template) {
    return inferTemplateMode(template) === targetMode;
  });
}

function setActiveModeUi(mode) {
  appState.mode = mode;
  const modeButtons = document.querySelectorAll(".mode-btn");
  for (let i = 0; i < modeButtons.length; i++) {
    modeButtons[i].classList.toggle("active", modeButtons[i].getAttribute("data-mode") === mode);
  }
  const notesLabel = document.getElementById("custom-notes-label");
  if (notesLabel) {
    if (mode === "quote") {
      notesLabel.textContent = "additional service details / quote notes";
    } else if (mode === "status") {
      notesLabel.textContent = "status inquiry details (e.g. dropped off this morning)";
    } else {
      notesLabel.textContent = "callback reason / message for advisor";
    }
  }
}

function renderTemplateVariationPills() {
  const container = document.getElementById("template-variation-pills");
  if (!container) return;
  const modeTemplates = getTemplatesForMode(appState.mode);
  if (modeTemplates.length > 0 && !modeTemplates.some(function (t) { return t.id === appState.activeTemplateId; })) {
    appState.activeTemplateId = modeTemplates[0].id;
  } else if (modeTemplates.length === 0) {
    appState.activeTemplateId = "";
  }
  container.innerHTML = "";
  modeTemplates.forEach(function (template) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    if (template.id === appState.activeTemplateId) {
      button.classList.add("active");
    }
    button.textContent = template.name;
    button.addEventListener("click", function () {
      selectEmailTemplate(template.id);
    });
    container.appendChild(button);
  });
}

function renderCategoryOptions() {
  const list = document.getElementById("category-options");
  if (!list) return;
  list.innerHTML = "";
  appState.categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    list.appendChild(option);
  });
}

function renderSettingsTemplateList() {
  const list = document.getElementById("settings-template-list");
  if (!list) return;
  const query = (document.getElementById("settings-template-search") || {}).value || "";
  list.innerHTML = "";
  appState.templates.filter(function (template) {
    const modeLabel = formatModeLabel(inferTemplateMode(template));
    return (template.name + " " + modeLabel + " " + template.subject).toLowerCase().includes(query.trim().toLowerCase());
  }).forEach(function (template) {
    const row = document.createElement("div");
    row.className = "settings-row";
    const info = document.createElement("span");
    info.textContent = template.name + " · " + formatModeLabel(inferTemplateMode(template));
    const actions = document.createElement("div");
    actions.className = "row-actions";
    [["use", function () {
      selectEmailTemplate(template.id);
      const modal = document.getElementById("settings-modal");
      if (modal) modal.classList.add("hidden");
    }], ["edit", function () { openTemplateEditor(template); }], ["delete", function () {
      if (!window.confirm("Delete template ‘" + template.name + "’?")) return;
      appState.templates = appState.templates.filter(function (item) { return item.id !== template.id; });
      if (appState.activeTemplateId === template.id) appState.activeTemplateId = "";
      saveSettingsToStorage();
      renderTemplateManagement();
      updateEmailPreview();
    }]].forEach(function (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action[0] === "delete" ? "btn btn-danger btn-small" : "btn btn-secondary btn-small";
      button.textContent = action[0];
      button.addEventListener("click", action[1]);
      actions.appendChild(button);
    });
    row.appendChild(info);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderSettingsServiceList() {
  const list = document.getElementById("settings-service-list");
  if (!list) return;
  const query = (document.getElementById("settings-service-search") || {}).value || "";
  list.innerHTML = "";
  appState.services.filter(function (service) {
    return (service.name + " " + service.category).toLowerCase().includes(query.trim().toLowerCase());
  }).forEach(function (service) {
    const row = document.createElement("div");
    row.className = "settings-row";
    const info = document.createElement("span");
    info.textContent = service.name + " · " + (service.category || "uncategorized");
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn btn-secondary btn-small";
    edit.textContent = "edit";
    edit.addEventListener("click", function () {
      const name = window.prompt("Service or problem name", service.name);
      if (!name || !name.trim()) return;
      const previousName = service.name;
      const category = window.prompt("Category", service.category || "Other");
      service.name = name.trim();
      appState.selectedServices = appState.selectedServices.map(function (selected) {
        return selected === previousName ? service.name : selected;
      });
      if (category && category.trim()) {
        service.category = category.trim();
        if (!appState.categories.includes(service.category)) appState.categories.push(service.category);
      }
      saveSettingsToStorage();
      renderServiceManagement();
      renderTemplateManagement();
      updateEmailPreview();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-danger btn-small";
    remove.textContent = "delete";
    remove.addEventListener("click", function () {
      if (!window.confirm("Delete ‘" + service.name + "’?")) return;
      appState.services = appState.services.filter(function (item) { return item !== service; });
      appState.selectedServices = appState.selectedServices.filter(function (name) { return name !== service.name; });
      saveSettingsToStorage();
      renderServiceManagement();
      renderServiceChips();
      updateEmailPreview();
    });
    actions.appendChild(edit);
    actions.appendChild(remove);
    row.appendChild(info);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderSettingsCategoryList() {
  const list = document.getElementById("settings-category-list");
  if (!list) return;
  list.innerHTML = "";
  appState.categories.forEach(function (category) {
    const row = document.createElement("div");
    row.className = "settings-row";
    const name = document.createElement("span");
    name.textContent = category;
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn btn-secondary btn-small";
    edit.textContent = "edit";
    edit.addEventListener("click", function () {
      const replacement = window.prompt("Category name", category);
      if (!replacement || !replacement.trim() || replacement.trim() === category) return;
      appState.categories = appState.categories.map(function (item) { return item === category ? replacement.trim() : item; });
      appState.categories = Array.from(new Set(appState.categories));
      appState.services.forEach(function (service) { if (service.category === category) service.category = replacement.trim(); });
      appState.templates.forEach(function (template) { if (template.category === category) template.category = replacement.trim(); });
      saveSettingsToStorage();
      renderTemplateManagement();
      renderServiceManagement();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-danger btn-small";
    remove.textContent = "delete";
    remove.addEventListener("click", function () {
      if (!window.confirm("Delete category ‘" + category + "’? Items in it will become uncategorized.")) return;
      appState.categories = appState.categories.filter(function (item) { return item !== category; });
      appState.services.forEach(function (service) { if (service.category === category) service.category = ""; });
      appState.templates.forEach(function (template) { if (template.category === category) template.category = ""; });
      saveSettingsToStorage();
      renderTemplateManagement();
      renderServiceManagement();
    });
    actions.appendChild(edit);
    actions.appendChild(remove);
    row.appendChild(name);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderTemplateManagement() {
  renderTemplateVariationPills();
  renderSettingsTemplateList();
  renderCategoryOptions();
  renderSettingsCategoryList();
}

function renderServiceManagement() {
  renderServiceChips();
  renderSettingsServiceList();
}

function openTemplateEditor(template) {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.classList.remove("hidden");
  const editor = document.getElementById("template-editor");
  if (!editor) return;
  appState.editingTemplateId = template ? (template.id || "") : "";
  document.getElementById("template-name-input").value = template ? (template.name || "") : "";
  const modeSelect = document.getElementById("template-mode-input");
  if (modeSelect) {
    modeSelect.value = template ? inferTemplateMode(template) : (appState.mode || "quote");
  }
  document.getElementById("template-subject-input").value = template ? (template.subject || "") : "";
  document.getElementById("template-body-input").value = template ? (template.body || "") : "";
  editor.classList.remove("hidden");
  if (typeof editor.scrollIntoView === "function") {
    editor.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  document.getElementById("template-name-input").focus();
}

function selectEmailTemplate(templateId) {
  const template = appState.templates.find(function (item) { return item.id === templateId; });
  if (!template) return;
  const mode = inferTemplateMode(template);
  setActiveModeUi(mode);
  appState.activeTemplateId = templateId;
  appState.previewEdited = false;
  renderTemplateVariationPills();
  updateEmailPreview();
  showToast("selected template: " + template.name + ".");
}

function makeReusableTemplateText(value) {
  const values = [
    [document.getElementById("customer-number").value.trim(), "{{customerNumber}}"],
    [document.getElementById("customer-name").value.trim(), "{{customerName}}"],
    [document.getElementById("customer-phone").value.trim(), "{{customerPhone}}"],
    [document.getElementById("customer-vin").value.trim(), "{{vin}}"],
    [document.getElementById("advisor-name-input").value.trim(), "{{advisorName}}"],
    [getRequestedServicesText(), "{{serviceDetails}}"],
    [appState.signature.trim(), "{{signature}}"]
  ].filter(function (pair) { return pair[0]; }).sort(function (a, b) { return b[0].length - a[0].length; });
  let reusable = value;
  values.forEach(function (pair) { reusable = reusable.split(pair[0]).join(pair[1]); });
  reusable = reusable.replace(/^Customer #:\s*\{\{customerNumber\}\}$/m, "{{customerNumberLine}}");
  const customerAndNumber = document.getElementById("customer-number").value.trim()
    ? "{{customerNumber}} {{customerName}}"
    : "{{customerName}}";
  reusable = reusable.split("{{customerNumber}} " + "{{customerName}}").join(customerAndNumber);
  return reusable;
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
  const customerNameEl = document.getElementById("customer-name");
  const customerPhoneEl = document.getElementById("customer-phone");
  const customerNumberEl = document.getElementById("customer-number");
  const customerVinEl = document.getElementById("customer-vin");

  let advisorName = "[Service Advisor]";
  if (advisorNameEl && advisorNameEl.value.trim() !== "") {
    advisorName = advisorNameEl.value.trim();
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
  const subjectCustomer = customerNumber !== "" ? (customerNumber + " " + customerName) : customerName;

  let subjectLine = "";
  let openingLine = "";

  if (appState.mode === "quote") {
    subjectLine = "PRICE QUOTE: " + subjectCustomer;
    openingLine = "Could you please provide a price quote for the request below?";
  } else if (appState.mode === "status") {
    subjectLine = "STATUS UPDATE: " + subjectCustomer;
    openingLine = "Could you please provide a status update for the customer below?";
  } else {
    subjectLine = "CALLBACK: " + subjectCustomer;
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
  bodyLines.push("VIN: " + vinValue);
  bodyLines.push("Problem / Service: " + serviceDetails);
  if (appState.signature && appState.signature.trim() !== "") {
    bodyLines.push("");
    bodyLines.push(appState.signature);
  }

  const previewSubject = document.getElementById("preview-subject");
  const previewBody = document.getElementById("preview-body");
  let previewSubjectValue = subjectLine;
  let previewBodyValue = bodyLines.join("\n");
  const modeTemplates = getTemplatesForMode(appState.mode);
  const activeTemplate = modeTemplates.find(function (template) { return template.id === appState.activeTemplateId; }) || modeTemplates[0] || null;
  if (activeTemplate && !appState.previewEdited) {
    appState.activeTemplateId = activeTemplate.id;
    const signatureTrimmed = appState.signature ? appState.signature.trim() : "";
    const replacements = {
      customerName: customerName,
      customerNumber: customerNumber,
      customerNumberLine: customerNumber ? "Customer #: " + customerNumber : "",
      customerPhone: phoneNumber,
      vin: vinValue,
      advisorName: advisorName,
      serviceDetails: serviceDetails,
      customerAndNumber: subjectCustomer,
      signature: signatureTrimmed
    };
    const fill = function (text) {
      const renderedLines = [];
      const rawLines = String(text || "").replace(/\r\n/g, "\n").split("\n");
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmedLine = line.trim();
        if (trimmedLine === "{{customerNumberLine}}" && customerNumber === "") {
          continue;
        }
        if (trimmedLine === "{{signature}}" && signatureTrimmed === "") {
          continue;
        }
        const replaced = line.replace(/{{\s*([a-zA-Z]+)\s*}}/g, function (match, key) {
          return Object.prototype.hasOwnProperty.call(replacements, key) ? replacements[key] : match;
        });
        renderedLines.push(replaced);
      }
      return renderedLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
    };
    previewSubjectValue = fill(activeTemplate.subject);
    previewBodyValue = fill(activeTemplate.body);
  }

  if (previewSubject && !appState.previewEdited) {
    previewSubject.value = previewSubjectValue;
  }
  if (previewBody && !appState.previewEdited) {
    previewBody.value = previewBodyValue;
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

  // fix common leading 5 -> S ocr confusion on bmw usa prefixes (5UX, 5YM, 5UM)
  if (fixed.length === 17 && rawDigitCount >= 2 && /^S(UX|YM|UM)/.test(fixed)) {
    fixed = "5" + fixed.slice(1);
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

  // check explicit vin labels first (supports spaces/hyphens inside vins and 7-char awp short vins)
  const labeledRegex = /\bvin\s*(?:no\.?|num\.?|number|#)?\s*[:#=\-\u2013\u2014]*\s*([A-Za-z0-9]{3,}(?:[ \t-][A-Za-z0-9]{2,})*)/gi;
  let labeledMatch = labeledRegex.exec(rawText);
  while (labeledMatch !== null) {
    const rawCandidate = labeledMatch[1];
    const compactCandidate = rawCandidate.replace(/[^a-zA-Z0-9]/g, "");
    const clean17 = normalizeVinCandidate(compactCandidate.length > 17 ? compactCandidate.slice(0, 17) : rawCandidate, false);
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

  // resilient scan anchored on known bmw/mini/rolls-royce prefixes when ocr glues icons or inserts stray spaces
  const prefixScanRegex = /(?:WBA|WBS|WBY|WBW|WBX|WMW|WMZ|5UX|5YM|5UM|3MW|3MF|4US|SCA|SBA|SCB|SLA|SUX|SYM|SUM)[A-Za-z0-9 \t-]{14,22}/gi;
  let prefixMatch = prefixScanRegex.exec(rawText);
  while (prefixMatch !== null) {
    const rawSpan = prefixMatch[0];
    const compactSpan = rawSpan.replace(/[^A-Za-z0-9]/g, "");
    if (compactSpan.length >= 17) {
      const slice17 = compactSpan.slice(0, 17);
      const cleanedPrefixVin = normalizeVinCandidate(slice17, false);
      if (cleanedPrefixVin !== "" && KNOWN_VIN_PREFIXES.indexOf(cleanedPrefixVin.slice(0, 3)) !== -1) {
        result.matchedTokens.push(rawSpan);
        result.vin = cleanedPrefixVin;
        return result;
      }
    }
    prefixMatch = prefixScanRegex.exec(rawText);
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

// strip leading 2-letter avatar circle initials like "(CF) Coni Farrell" or "SR Saied Rakhshandeh"
function stripLeadingAvatarInitials(text) {
  if (!text) {
    return "";
  }
  return String(text).replace(/^[([{\s]*[A-Z]{2}[)\]}\s]+(?=[A-Z][a-z].*\s+[A-Z][a-z])/, "").trim();
}

// clean ocr icon artifacts from an unlabeled tekion name candidate and validate 2-4 capitalized words
function extractCleanPersonNameCandidate(rawSegment) {
  if (!rawSegment || /[A-Za-z0-9]@[A-Za-z0-9]/.test(rawSegment) || /\b(?:19|20)\d{2}\b/.test(rawSegment) || isNonCustomerNameText(rawSegment)) {
    return "";
  }

  const tokens = String(rawSegment).trim().split(/\s+/);
  while (tokens.length > 2 && !/^(?:[A-Za-z][a-z][A-Za-z'.-]+|[A-Z][a-z])$/.test(tokens[0])) {
    tokens.shift();
  }
  while (tokens.length > 2) {
    const lastTok = tokens[tokens.length - 1];
    if (/[^A-Za-z'.-]/.test(lastTok) || /^[A-Za-z]$/.test(lastTok) || /^[A-Z]{2}$/.test(lastTok)) {
      tokens.pop();
    } else {
      break;
    }
  }

  const cleanedTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].replace(/^[^A-Za-z]+/, "").replace(/[^A-Za-z'.-]+$/, "");
    if (t !== "") {
      cleanedTokens.push(t);
    }
  }

  const cand = cleanedTokens.join(" ").trim();
  if (cand === "" || /\d|@|\//.test(cand) || isNonCustomerNameText(cand)) {
    return "";
  }

  const words = cand.split(/\s+/);
  if (words.length < 2 || words.length > 4) {
    return "";
  }

  let longWordCount = 0;
  let capCount = 0;
  const fixedWords = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^[a-z]$/.test(w)) {
      return "";
    }
    if (/^(?:de|van|von|la|le|da|del)$/i.test(w)) {
      fixedWords.push(w.toLowerCase());
    } else if (/^[A-Za-z][A-Za-z'.-]{1,}$/.test(w)) {
      longWordCount++;
      if (/^[A-Z]/.test(w)) {
        capCount++;
        fixedWords.push(w);
      } else {
        fixedWords.push(w.charAt(0).toUpperCase() + w.slice(1));
      }
    } else if (/^[A-Z]\.?$/.test(w)) {
      fixedWords.push(w);
    } else {
      return "";
    }
  }

  if (longWordCount < 2 || capCount < 1) {
    return "";
  }

  return normalizeCustomerName(fixedWords.join(" "));
}

// strip non-customer tokens (emails, vins, phones, RO#, Tag#, stock codes, mileage, dates) before matching name or customer #
function scrubNonCustomerText(rawText, matchedVinTokens) {
  let scrubbed = String(rawText || "")
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\b[A-HJ-NPR-Z0-9]{17}\b/gi, " ")
    .replace(PHONE_SCRUB_REGEX, "$1 ")
    .replace(/\bRO\s*#?\s*[:#=\-\u2013\u2014]*\s*\d[\d\-]*\b/gi, " ")
    .replace(/\bRepair\s+Order\s*#?\s*[:#=\-\u2013\u2014]*\s*\d[\d\-]*\b/gi, " ")
    .replace(/\bTag\s*#?\s*[:#=\-\u2013\u2014]*\s*\d[\d\-]*\b/gi, " ")
    .replace(/\b[A-Z]{1,4}[-\u2013\u2014]\d{3,8}\b/g, " ")
    .replace(/\b\d{1,3}(?:,\d{3})+\s*(?:km|mi|miles)?\b/gi, " ")
    .replace(/\b\d+\s*(?:km|mi|miles)\b/gi, " ")
    .replace(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b[^\r\n|]*/gi, " ")
    .replace(/\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/gi, " ");

  if (Array.isArray(matchedVinTokens)) {
    for (let v = 0; v < matchedVinTokens.length; v++) {
      const rawVinToken = matchedVinTokens[v];
      if (rawVinToken) {
        scrubbed = scrubbed.split(rawVinToken).join(" ");
      }
    }
  }
  return scrubbed;
}

// find the best unlabeled 2-4 word person name in scrubbed text, preferring lines adjacent to a phone number
function findBestUnlabeledPersonName(rawBlock, scrubbedBlock, phoneInfo) {
  const rawLines = String(rawBlock || "").split(/\r?\n/);
  const phoneLineIndices = [];
  if (phoneInfo && phoneInfo.rawToken) {
    for (let r = 0; r < rawLines.length; r++) {
      if (rawLines[r].indexOf(phoneInfo.rawToken) !== -1 || PHONE_EXTRACT_REGEX.test(rawLines[r])) {
        phoneLineIndices.push(r);
      }
    }
  }

  let firstCandidate = "";
  let phoneAdjacentCandidate = "";
  const scrubbedLines = String(scrubbedBlock || "").split(/\r?\n/);
  for (let i = 0; i < scrubbedLines.length; i++) {
    const segments = scrubbedLines[i].split(/[|\t•]+/);
    for (let s = 0; s < segments.length; s++) {
      const candName = extractCleanPersonNameCandidate(segments[s]);
      if (candName === "") {
        continue;
      }
      if (firstCandidate === "") {
        firstCandidate = candName;
      }
      for (let p = 0; p < phoneLineIndices.length; p++) {
        if (Math.abs(i - phoneLineIndices[p]) <= 2) {
          phoneAdjacentCandidate = candName;
          break;
        }
      }
      if (phoneAdjacentCandidate !== "") {
        break;
      }
    }
    if (phoneAdjacentCandidate !== "") {
      break;
    }
  }

  return phoneAdjacentCandidate !== "" ? phoneAdjacentCandidate : firstCandidate;
}

// pull out the vin, phone, customer #, and name from ocr or pasted tekion text
function parseTekionOrAwpText(rawText, options) {
  if (!rawText || rawText.trim() === "") {
    showToast("no text found to parse.");
    return;
  }

  if (options && options.clearPrevious) {
    const clearIds = ["customer-name", "customer-number", "customer-phone", "customer-vin"];
    for (let c = 0; c < clearIds.length; c++) {
      const clearEl = document.getElementById(clearIds[c]);
      if (clearEl) {
        clearEl.value = "";
      }
    }
    const resetHelper = document.getElementById("vin-helper-text");
    if (resetHelper) {
      resetHelper.textContent = "paste full vin or 7 chars for awp";
    }
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

  const scrubbedText = scrubNonCustomerText(rawText, vinInfo.matchedTokens);

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
    const cleanedLabeledLine = nameMatch[1]
      .split("|")[0]
      .replace(/\s+(?:Vehicle|Phone|Email|VIN|Last\s+Visit|Appointment|Upcoming|Notify|Cancel|Edit|RO\s*#|Tag\s*#)\b.*/i, "")
      .replace(/\s*\([^0-9)]{0,5}\)\s*$/g, "")
      .replace(/\s*[^\w)\]]+\s*$/, "")
      .trim();
    const splitLabeled = splitNameAndCustomerNumber(cleanedLabeledLine);
    const cleanedLabeledName = stripLeadingAvatarInitials(splitLabeled.name);
    if (cleanedLabeledName !== "" && !isNonCustomerNameText(cleanedLabeledName)) {
      foundName = cleanedLabeledName;
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
        const segName = stripLeadingAvatarInitials(segSplit.name);
        if (segName !== "" && segSplit.customerNumber !== "") {
          const wordCount = segName.split(/\s+/).length;
          if (wordCount >= 1 && wordCount <= 4) {
            if (foundName === "") {
              foundName = segName;
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

  // fallback for unlabeled tekion RO header bars: prioritize rightmost banner column if available, then scan full text
  if (foundName === "") {
    if (options && options.preferredNameText) {
      const preferredScrubbed = scrubNonCustomerText(options.preferredNameText, vinInfo.matchedTokens);
      foundName = findBestUnlabeledPersonName(options.preferredNameText, preferredScrubbed, phoneInfo);
    }
    if (foundName === "") {
      foundName = findBestUnlabeledPersonName(rawText, scrubbedText, phoneInfo);
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

// pad a canvas region with solid white borders so tesseract reads edge characters cleanly
function buildPaddedColumnDataUrl(sourceCanvas, startX, width, height, pad) {
  const colCanvas = document.createElement("canvas");
  colCanvas.width = width + pad * 2;
  colCanvas.height = height + pad * 2;
  const colCtx = colCanvas.getContext("2d");
  if (!colCtx) {
    return "";
  }
  colCtx.fillStyle = "#ffffff";
  colCtx.fillRect(0, 0, colCanvas.width, colCanvas.height);
  colCtx.drawImage(sourceCanvas, startX, 0, width, height, pad, pad, width, height);
  return colCanvas.toDataURL("image/png");
}

// detect full-height gray vertical divider lines inside wide short banners
function detectVerticalBannerDividers(rawGray, width, height, scale) {
  const dividers = [];
  const yStart = Math.floor(height * 0.1);
  const yEnd = Math.ceil(height * 0.9);
  const sampleRows = Math.max(1, yEnd - yStart);
  const xMin = Math.floor(width * 0.05);
  const xMax = Math.ceil(width * 0.95);
  const minGap = Math.max(80 * scale, Math.floor(width * 0.14));

  for (let x = xMin; x < xMax; x++) {
    let grayCount = 0;
    let sum = 0;
    for (let y = yStart; y < yEnd; y++) {
      const g = rawGray[y * width + x];
      sum += g;
      if (g >= 140 && g <= 240) {
        grayCount++;
      }
    }
    const avg = sum / sampleRows;
    if (grayCount / sampleRows >= 0.7 && avg < 242) {
      if (dividers.length === 0 || x - dividers[dividers.length - 1] >= minGap) {
        dividers.push(x);
      }
    }
  }
  return dividers;
}

// upscale small tekion snips, pad edges, split wide banners into columns, and boost contrast gently
function preprocessImageForOcr(dataUrl) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () {
      try {
        let scale = 1;
        if (img.height < 120) {
          scale = Math.min(4, Math.max(3, Math.ceil(220 / img.height)));
          const maxScaleForWidth = Math.floor(3600 / img.width) || 1;
          scale = Math.max(1, Math.min(scale, maxScaleForWidth));
        } else if (img.width < 1200 || img.height < 400) {
          scale = 2;
        }

        const scaledW = img.width * scale;
        const scaledH = img.height * scale;
        const pad = 24;

        const workCanvas = document.createElement("canvas");
        workCanvas.width = scaledW;
        workCanvas.height = scaledH;
        const workCtx = workCanvas.getContext("2d");
        if (!workCtx) {
          resolve({ fullDataUrl: dataUrl, columnDataUrls: [] });
          return;
        }
        workCtx.imageSmoothingEnabled = true;
        workCtx.imageSmoothingQuality = "high";
        workCtx.drawImage(img, 0, 0, scaledW, scaledH);

        const imageData = workCtx.getImageData(0, 0, scaledW, scaledH);
        const data = imageData.data;
        const pixelCount = data.length / 4;
        const rawGray = new Float32Array(pixelCount);

        let brightnessTotal = 0;
        for (let p = 0; p < pixelCount; p++) {
          const i = p * 4;
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          rawGray[p] = gray;
          brightnessTotal = brightnessTotal + gray;
        }
        const avgBrightness = brightnessTotal / pixelCount;
        // invert dark-mode screenshots so tesseract always reads dark text on a light background
        const isDarkBackground = avgBrightness < 115;
        if (isDarkBackground) {
          for (let p = 0; p < pixelCount; p++) {
            rawGray[p] = 255 - rawGray[p];
          }
        }

        let dividers = [];
        if (img.width / img.height >= 3.2) {
          dividers = detectVerticalBannerDividers(rawGray, scaledW, scaledH, scale);
        }

        // gentle contrast stretch around midpoint 128 so thin strokes (like n/i) stay separated
        for (let p = 0; p < pixelCount; p++) {
          const i = p * 4;
          let contrasted = (rawGray[p] - 128) * 1.32 + 128;
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
        workCtx.putImageData(imageData, 0, 0);

        const paddedCanvas = document.createElement("canvas");
        paddedCanvas.width = scaledW + pad * 2;
        paddedCanvas.height = scaledH + pad * 2;
        const paddedCtx = paddedCanvas.getContext("2d");
        let fullDataUrl = dataUrl;
        if (paddedCtx) {
          paddedCtx.fillStyle = "#ffffff";
          paddedCtx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
          paddedCtx.drawImage(workCanvas, pad, pad);
          fullDataUrl = paddedCanvas.toDataURL("image/png");
        } else {
          fullDataUrl = workCanvas.toDataURL("image/png");
        }

        const columnDataUrls = [];
        if (dividers.length >= 1) {
          const bounds = [0].concat(dividers, [scaledW]);
          const trimEdge = 4 * scale;
          for (let b = 0; b < bounds.length - 1; b++) {
            const left = bounds[b] + (b === 0 ? 0 : trimEdge);
            const right = bounds[b + 1] - (b === bounds.length - 2 ? 0 : trimEdge);
            const sliceW = right - left;
            if (sliceW >= 60 * scale) {
              const colUrl = buildPaddedColumnDataUrl(workCanvas, left, sliceW, scaledH, pad);
              if (colUrl !== "") {
                columnDataUrls.push(colUrl);
              }
            }
          }
        }

        resolve({
          fullDataUrl: fullDataUrl,
          columnDataUrls: columnDataUrls.length >= 2 ? columnDataUrls : []
        });
      } catch (err) {
        resolve({ fullDataUrl: dataUrl, columnDataUrls: [] });
      }
    };
    img.onerror = function () {
      resolve({ fullDataUrl: dataUrl, columnDataUrls: [] });
    };
    img.src = dataUrl;
  });
}

// collect line objects from tesseract v5 data whether exposed via data.lines or data.blocks
function collectOcrLines(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data.lines) && data.lines.length > 0) {
    return data.lines;
  }
  const collected = [];
  if (Array.isArray(data.blocks)) {
    for (let b = 0; b < data.blocks.length; b++) {
      const paras = data.blocks[b] && data.blocks[b].paragraphs;
      if (!Array.isArray(paras)) {
        continue;
      }
      for (let p = 0; p < paras.length; p++) {
        const lines = paras[p] && paras[p].lines;
        if (!Array.isArray(lines)) {
          continue;
        }
        for (let l = 0; l < lines.length; l++) {
          collected.push(lines[l]);
        }
      }
    }
  }
  return collected;
}

// rebuild ocr lines while inserting " | " across wide horizontal column gaps
function extractStructuredTextFromOcrData(data) {
  if (!data) {
    return "";
  }
  const lines = collectOcrLines(data);
  if (lines.length === 0) {
    return data.text || "";
  }

  const outLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (Array.isArray(line.words) && line.words.length > 0) {
      let lineHeight = 16;
      if (line.bbox && typeof line.bbox.y1 === "number" && typeof line.bbox.y0 === "number") {
        lineHeight = Math.max(10, line.bbox.y1 - line.bbox.y0);
      }
      const gapThreshold = Math.max(32, lineHeight * 2.2);
      let lineStr = "";
      for (let w = 0; w < line.words.length; w++) {
        const word = line.words[w];
        const wordText = word && word.text ? String(word.text).trim() : "";
        if (wordText === "") {
          continue;
        }
        if (lineStr === "") {
          lineStr = wordText;
        } else {
          const prev = line.words[w - 1];
          const hasBoxes = prev && prev.bbox && word.bbox && typeof prev.bbox.x1 === "number" && typeof word.bbox.x0 === "number";
          const gap = hasBoxes ? (word.bbox.x0 - prev.bbox.x1) : 0;
          lineStr = lineStr + (gap > gapThreshold ? " | " : " ") + wordText;
        }
      }
      if (lineStr !== "") {
        outLines.push(lineStr);
      }
    } else if (line.text && String(line.text).trim() !== "") {
      outLines.push(String(line.text).trim());
    }
  }

  if (outLines.length > 0) {
    return outLines.join("\n");
  }
  return data.text || "";
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

  let worker = null;
  try {
    const prep = await preprocessImageForOcr(appState.screenshotDataUrl);
    let combinedText = "";
    let preferredNameText = "";

    if (prep.columnDataUrls.length >= 2) {
      if (typeof window.Tesseract.createWorker === "function") {
        worker = await window.Tesseract.createWorker("eng");
      }
      const colTexts = [];
      for (let c = 0; c < prep.columnDataUrls.length; c++) {
        const res = worker
          ? await worker.recognize(prep.columnDataUrls[c])
          : await window.Tesseract.recognize(prep.columnDataUrls[c], "eng");
        const colText = extractStructuredTextFromOcrData(res.data);
        if (colText.trim() !== "") {
          colTexts.push(colText);
        }
      }
      if (colTexts.length > 0) {
        preferredNameText = colTexts[colTexts.length - 1];
      }
      combinedText = colTexts.join("\n");
    } else {
      const result = await window.Tesseract.recognize(prep.fullDataUrl, "eng");
      combinedText = extractStructuredTextFromOcrData(result.data);
    }

    parseTekionOrAwpText(combinedText, { clearPrevious: true, preferredNameText: preferredNameText });
    if (statusText) {
      statusText.setAttribute("data-last-ocr", combinedText.slice(0, 600));
      statusText.textContent = "ocr done — verify fields below.";
    }
  } catch (err) {
    if (statusText) {
      statusText.textContent = "ocr scan encountered an error. you can still copy the screenshot with your email.";
    }
  } finally {
    if (worker && typeof worker.terminate === "function") {
      try {
        await worker.terminate();
      } catch (terminateErr) {
        // ignore cleanup errors
      }
    }
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

  appState.previewEdited = false;
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
  renderTemplateManagement();
  renderServiceManagement();

  const sigInput = document.getElementById("signature-input");
  if (sigInput) {
    sigInput.value = appState.signature;
  }

  // switching between price quote, status update, and callback
  const modeButtons = document.querySelectorAll(".mode-btn");
  for (let i = 0; i < modeButtons.length; i++) {
    modeButtons[i].addEventListener("click", function () {
      const nextMode = modeButtons[i].getAttribute("data-mode");
      setActiveModeUi(nextMode);
      const modeTemplates = getTemplatesForMode(nextMode);
      appState.activeTemplateId = modeTemplates.length > 0 ? modeTemplates[0].id : "";
      appState.previewEdited = false;
      renderTemplateVariationPills();
      updateEmailPreview();
    });
  }

  const serviceSearch = document.getElementById("service-search");
  if (serviceSearch) serviceSearch.addEventListener("input", renderServiceChips);

  const manageTemplatesInlineBtn = document.getElementById("manage-templates-inline-btn");
  if (manageTemplatesInlineBtn) {
    manageTemplatesInlineBtn.addEventListener("click", function () {
      const modal = document.getElementById("settings-modal");
      if (modal) modal.classList.remove("hidden");
      const sec = document.getElementById("settings-templates-section");
      if (sec && typeof sec.scrollIntoView === "function") {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  const quickAddAdvisorBtn = document.getElementById("quick-add-advisor-btn");
  if (quickAddAdvisorBtn) {
    quickAddAdvisorBtn.addEventListener("click", function () {
      const nameEl = document.getElementById("advisor-name-input");
      if (nameEl) {
        addOrSelectAdvisorByName(nameEl.value);
      }
    });
  }

  const saveTemplateBtn = document.getElementById("save-template-btn");
  if (saveTemplateBtn) saveTemplateBtn.addEventListener("click", function () {
    openTemplateEditor({
      id: "",
      mode: appState.mode,
      name: "",
      subject: makeReusableTemplateText(document.getElementById("preview-subject").value),
      body: makeReusableTemplateText(document.getElementById("preview-body").value)
    });
  });
  const newTemplateBtn = document.getElementById("new-template-btn");
  if (newTemplateBtn) newTemplateBtn.addEventListener("click", function () {
    openTemplateEditor({ id: "", mode: appState.mode, name: "", subject: "", body: "" });
  });
  const templateListSearch = document.getElementById("settings-template-search");
  if (templateListSearch) templateListSearch.addEventListener("input", renderSettingsTemplateList);
  const serviceListSearch = document.getElementById("settings-service-search");
  if (serviceListSearch) serviceListSearch.addEventListener("input", renderSettingsServiceList);
  const saveTemplateEditorBtn = document.getElementById("save-template-editor-btn");
  if (saveTemplateEditorBtn) saveTemplateEditorBtn.addEventListener("click", function () {
    const name = document.getElementById("template-name-input").value.trim();
    if (!name) { showToast("enter a template name."); return; }
    const modeSelect = document.getElementById("template-mode-input");
    const mode = modeSelect ? modeSelect.value : (appState.mode || "quote");
    const template = {
      id: appState.editingTemplateId || ("template-" + Date.now()),
      mode: mode,
      name: name,
      subject: document.getElementById("template-subject-input").value,
      body: document.getElementById("template-body-input").value
    };
    const existing = appState.templates.findIndex(function (item) { return item.id === template.id; });
    if (existing === -1) appState.templates.push(template);
    else appState.templates[existing] = template;
    setActiveModeUi(mode);
    appState.activeTemplateId = template.id;
    appState.previewEdited = false;
    saveSettingsToStorage();
    document.getElementById("template-editor").classList.add("hidden");
    renderTemplateManagement();
    updateEmailPreview();
    showToast("saved template: " + name + ".");
  });
  const cancelTemplateEditorBtn = document.getElementById("cancel-template-editor-btn");
  if (cancelTemplateEditorBtn) cancelTemplateEditorBtn.addEventListener("click", function () {
    document.getElementById("template-editor").classList.add("hidden");
  });
  const addServiceBtn = document.getElementById("add-service-btn");
  if (addServiceBtn) addServiceBtn.addEventListener("click", function () {
    const nameInput = document.getElementById("new-service-name");
    const categoryInput = document.getElementById("new-service-category");
    const name = nameInput.value.trim();
    if (!name) { showToast("enter a service or problem."); return; }
    const category = categoryInput.value.trim() || "Other";
    if (!appState.categories.includes(category)) appState.categories.push(category);
    appState.services.push({ name: name, category: category });
    nameInput.value = "";
    categoryInput.value = "";
    saveSettingsToStorage();
    renderServiceManagement();
    renderTemplateManagement();
    showToast("added service or problem: " + name + ".");
  });
  const addCategoryBtn = document.getElementById("add-category-btn");
  if (addCategoryBtn) addCategoryBtn.addEventListener("click", function () {
    const input = document.getElementById("new-category-name");
    const category = input.value.trim();
    if (!category) { showToast("enter a category name."); return; }
    if (!appState.categories.some(function (item) { return item.toLowerCase() === category.toLowerCase(); })) appState.categories.push(category);
    input.value = "";
    saveSettingsToStorage();
    renderTemplateManagement();
    showToast("added category: " + category + ".");
  });

  // update the email preview whenever i type in any text box
  const liveFieldIds = [
    "advisor-name-input",
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
        appState.previewEdited = false;
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

  ["preview-subject", "preview-body"].forEach(function (id) {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", function () { appState.previewEdited = true; });
  });

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

  // buttons for copying subject line, body, and opening mailto
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
      const subjEl = document.getElementById("preview-subject");
      const bodyEl = document.getElementById("preview-body");

      let subject = "";
      if (subjEl) {
        subject = encodeURIComponent(subjEl.value);
      }
      let body = "";
      if (bodyEl) {
        body = encodeURIComponent(bodyEl.value);
      }

      const mailtoUrl = "mailto:?subject=" + subject + "&body=" + body;
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
      if (!nameEl) {
        return;
      }
      if (addOrSelectAdvisorByName(nameEl.value)) {
        nameEl.value = "";
      }
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
            renderTemplateManagement();
            renderServiceManagement();
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
