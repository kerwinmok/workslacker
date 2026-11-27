const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function createParserContext() {
  const elements = {};

  function createElement(tagName) {
    const element = {
      tagName: tagName,
      className: "",
      children: [],
      classList: { add: function () {} },
      addEventListener: function () {},
      appendChild: function (child) {
        this.children.push(child);
      }
    };
    Object.defineProperty(element, "innerHTML", {
      set: function () {
        this.children = [];
      }
    });
    return element;
  }

  ["customer-name", "customer-number", "customer-phone", "customer-vin", "vin-helper-text", "advisor-name-input"].forEach(function (id) {
    elements[id] = { value: "", textContent: "" };
  });

  const context = {
    document: {
      addEventListener: function () {},
      createElement: createElement,
      getElementById: function (id) {
        return elements[id] || null;
      }
    },
    window: {},
    localStorage: {}
  };
  vm.createContext(context);
  vm.runInContext(appSource + "\nupdateEmailPreview = function () {};", context);
  elements["advisor-pills"] = createElement("div");
  return { context: context, elements: elements };
}

function parseText(rawText) {
  const parser = createParserContext();
  vm.runInContext("parseTekionOrAwpText(" + JSON.stringify(rawText) + ", { clearPrevious: true });", parser.context);
  return parser.elements;
}

test("cleans OCR symbol noise without losing separated name words", function () {
  const parser = createParserContext();
  const cleaned = vm.runInContext('cleanOcrText("Jane@@ Doe  @@  Smith")', parser.context);
  assert.equal(cleaned, "Jane Doe Smith");
});

test("parses a two-digit customer number beside a labeled customer name", function () {
  const fields = parseText("Customer Name: Jane Doe\nCustomer #: 42");
  assert.equal(fields["customer-name"].value, "Jane Doe");
  assert.equal(fields["customer-number"].value, "42");
});

test("parses a seven-digit id and a long all-caps name with a middle name", function () {
  const fields = parseText("Customer Name: SMITH, JOHN MICHAEL ALEXANDER (4829107)");
  assert.equal(fields["customer-name"].value, "John Michael Alexander Smith");
  assert.equal(fields["customer-number"].value, "4829107");
});

test("finds an unlabeled two-digit id next to the customer's name", function () {
  const fields = parseText("Customer Name: Jane Doe\n42");
  assert.equal(fields["customer-name"].value, "Jane Doe");
  assert.equal(fields["customer-number"].value, "42");
});

test("does not mistake a model year or an eight-digit value for a customer number", function () {
  const yearFields = parseText("Customer Name: Jane Doe\n2024");
  const longFields = parseText("Customer #: 12345678");
  assert.equal(yearFields["customer-number"].value, "");
  assert.equal(longFields["customer-number"].value, "");
});

test("accepts long multi-part names in an unlabeled section", function () {
  const parser = createParserContext();
  const candidate = vm.runInContext('extractCleanPersonNameCandidate("Mary Ann Elizabeth van Buren")', parser.context);
  assert.equal(candidate, "Mary Ann Elizabeth van Buren");
});

test("advisor pills select without displaying a remove control", function () {
  const parser = createParserContext();
  vm.runInContext('appState.advisors = [{ name: "Jane Doe" }, { name: "John Smith" }]; renderAdvisorPills();', parser.context);
  const pills = parser.elements["advisor-pills"].children;
  assert.equal(pills.length, 2);
  assert.equal(pills[0].children.length, 1);
  assert.equal(pills[0].children[0].textContent, "Jane Doe");
});

test("advisor names can be changed without allowing duplicates", function () {
  const parser = createParserContext();
  vm.runInContext([
    "saveSettingsToStorage = function () {};",
    "renderAdvisorPills = function () {};",
    "renderSettingsAdvisorList = function () {};",
    "updateEmailPreview = function () {};",
    "showToast = function () {};",
    'appState.advisors = [{ name: "Jane Doe", email: "" }, { name: "John Smith", email: "" }];',
    "appState.selectedAdvisorIndex = 0;",
    'updateAdvisorNameAtIndex(0, "Jane Brown");'
  ].join("\n"), parser.context);
  assert.equal(parser.elements["advisor-name-input"].value, "Jane Brown");
  assert.equal(vm.runInContext('updateAdvisorNameAtIndex(0, "John Smith")', parser.context), false);
  assert.equal(vm.runInContext("appState.advisors[0].name", parser.context), "Jane Brown");
});

test("all built-in and previously saved templates use the customer concerns label", function () {
  const parser = createParserContext();
  const bodies = vm.runInContext("DEFAULT_TEMPLATES.map(function (template) { return template.body; })", parser.context);
  assert.equal(bodies.length, 9);
  bodies.forEach(function (body) {
    assert.match(body, /Customer Concerns: \{\{serviceDetails\}\}/);
    assert.doesNotMatch(body, /Problem\s*\/\s*Service:/i);
  });

  const migrated = vm.runInContext(
    'normalizeLoadedTemplates([{ id: "saved", name: "Saved", subject: "Subject", body: "Problem / Service: {{serviceDetails}}" }])[0].body',
    parser.context
  );
  assert.equal(migrated, "Customer Concerns: {{serviceDetails}}");
});
