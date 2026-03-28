const http = require("http");
const https = require("https");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const os = require("os");
const { chromium } = require("playwright-core");

const port = Number(process.argv[2] || 8080);
const rootDir = path.resolve(__dirname, "..");
const dataRootDir = path.resolve(process.env.CSR_DATA_DIR || rootDir);
const sessionFilePath = path.resolve(dataRootDir, "session-state.json");
const csrDbDirPath = path.resolve(dataRootDir, "db");
const downloadsDirPath = path.resolve(dataRootDir, "downloads");
const csrExportPayloadStore = new Map();
let exportBrowserPromise = null;
const sseClients = new Set();
const municipalityWriteQueues = new Map();
loadDotEnv(path.resolve(__dirname, ".env"));
loadDotEnv(path.resolve(rootDir, ".env"));

const LOGIN_SHEET = process.env.LOGIN_SHEET || "MLS";
const MLS_API_BASE_URL =
  process.env.MLS_API_BASE_URL ||
  "https://script.google.com/macros/s/AKfycbyPJ1DViXnL8ft-9yPVjCs9UFo87oc3-u8g2tMqwyu9NlcUMrfZh_9RtO12UIChmjJv/exec";
const MUNICIPALITY_API_BASE_URL =
  process.env.MUNICIPALITY_API_BASE_URL ||
  "https://ph1.csrgenerator.site/excel/json/generate_1/9b28a812be6142ad5e6ed7f1c4755ee8";
const MUNICIPALITY_API_SIG =
  process.env.MUNICIPALITY_API_SIG ||
  "7a5959181519a8c8e65b02ea3fb281ca0b2143f19b0dd9e71a13e88d29a6a7de";
const USE_SERVER_AUTH = String(process.env.USE_SERVER_AUTH || "0").trim() === "1";
const USE_SERVER_SHEET_PROXY =
  String(process.env.USE_SERVER_SHEET_PROXY || "1").trim() !== "0";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function loadDotEnv(filePath) {
  let raw = "";
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (_) {
    return;
  }
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = String(line || "").trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function resolveFilePath(urlPathname) {
  let requestPath = decodeURIComponent(urlPathname.split("?")[0]);
  if (requestPath === "/") {
    requestPath = "/main/index.html";
  }

  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(rootDir, normalized);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  return absolutePath;
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readSession() {
  try {
    const raw = fs.readFileSync(sessionFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

function writeSession(session) {
  const payload = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(sessionFilePath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function clearSession() {
  try {
    if (fs.existsSync(sessionFilePath)) {
      fs.unlinkSync(sessionFilePath);
    }
  } catch (_) {
    // Ignore cleanup errors.
  }
}

function getAuthenticatedSession() {
  const session = readSession();
  if (!session || session.loggedIn !== true) {
    return null;
  }
  const id = String(session.id || "").trim();
  const municipality = sanitizeMunicipalityName(session.municipality);
  if (!id || !municipality) {
    return null;
  }
  return {
    ...session,
    id,
    municipality,
  };
}

function sendAuthRequired(res) {
  sendJson(res, 401, { ok: false, error: "Authentication required." });
}

function sendMunicipalityForbidden(res) {
  sendJson(res, 403, { ok: false, error: "Forbidden municipality access." });
}

function sendSseEvent(res, eventName, payload) {
  try {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  } catch (_) {
    // Ignore stream write errors.
  }
}

function broadcastSessionState() {
  const session = readSession();
  const payload = { ok: true, session: session };
  for (const client of sseClients) {
    sendSseEvent(client, "session", payload);
  }
}

function parseJsonBody(req, options) {
  const config = {
    maxBytes: 5_000_000,
    ...(options || {}),
  };
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > config.maxBytes) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!data.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sanitizePdfFileName(value) {
  const safe = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return safe || "CSR";
}

function createExportToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getHeadlessBrowserExecutablePath() {
  const candidates = [
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (_) {
      // Ignore per-candidate filesystem errors.
    }
  }
  return null;
}

async function getExportBrowser() {
  if (exportBrowserPromise) {
    return exportBrowserPromise;
  }
  const browserPath = getHeadlessBrowserExecutablePath();
  if (!browserPath) {
    throw new Error("No headless browser found (Edge/Chrome).");
  }
  exportBrowserPromise = chromium.launch({
    headless: true,
    executablePath: browserPath,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });
  try {
    const browser = await exportBrowserPromise;
    browser.on("disconnected", () => {
      exportBrowserPromise = null;
    });
    return browser;
  } catch (error) {
    exportBrowserPromise = null;
    throw error;
  }
}

async function renderPdfWithPlaywright(url, outputPath) {
  const browser = await getExportBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    await page.emulateMedia({ media: "print" });
    await page.waitForFunction(
      "window.__CSR_EXPORT_READY__ === true || (document && document.documentElement && document.documentElement.getAttribute('data-csr-export-ready') === '1')",
      { timeout: 120000 }
    );
    await page.waitForTimeout(300);
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      scale: 1,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await context.close();
  }
}

function normalizeMunicipalitySheetName(sheetName) {
  const safeSheetName = String(sheetName || "").trim().toUpperCase();
  if (safeSheetName === "PRES.CARLOS P. GARCIA") {
    return "PRESIDENT CARLOS P. GARCIA";
  }
  return safeSheetName;
}

function toSheetJsonBaseName(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ");
}

function toLegacySheetJsonBaseName(value) {
  return String(value || "").trim().replace(/[^\w.-]+/g, "_");
}

function buildSheetNameCandidates(sheetName, isLoginSheet) {
  const safe = String(sheetName || "").trim();
  const candidates = new Set();
  if (!safe) {
    return [];
  }

  candidates.add(safe);

  if (!isLoginSheet) {
    const normalized = normalizeMunicipalitySheetName(safe);
    candidates.add(normalized);
    // Compatibility alias for names like "DAUIS 530" where local cache may be "DAUIS.json".
    const strippedTrailingCode = normalized.replace(/\s+\d+\s*$/, "").trim();
    if (strippedTrailingCode) {
      candidates.add(strippedTrailingCode);
    }
  } else {
    candidates.add(LOGIN_SHEET);
  }

  return Array.from(candidates).filter(Boolean);
}

function readLocalSheetData(sheetName, isLoginSheet) {
  const sheetNames = buildSheetNameCandidates(sheetName, isLoginSheet);
  const roots = [downloadsDirPath, csrDbDirPath];

  for (const root of roots) {
    for (const name of sheetNames) {
      const fileNames = [
        `${toSheetJsonBaseName(name)}.json`,
        `${toLegacySheetJsonBaseName(name)}.json`,
      ];

      for (const fileName of fileNames) {
        if (!fileName || fileName === ".json") {
          continue;
        }
        const filePath = path.resolve(root, fileName);
        try {
          if (!fs.existsSync(filePath)) {
            continue;
          }
          const raw = fs.readFileSync(filePath, "utf8");
          const parsed = JSON.parse(raw);
          const data = extractSheetData(parsed);
          if (data) {
            return { data, filePath };
          }
        } catch (_) {
          // Ignore unreadable/invalid local files and continue searching.
        }
      }
    }
  }

  return null;
}

function extractSheetData(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  if (payload && Array.isArray(payload.rows)) {
    return payload.rows;
  }
  return null;
}

function normalizeValueForSignature(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value);
  }
}

function createRowsSignature(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "0:0:0";
  }

  let hash = 2166136261;
  const prime = 16777619;
  const schemaSet = new Set();
  const hashText = (text) => {
    const raw = String(text || "");
    for (let i = 0; i < raw.length; i += 1) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, prime);
    }
  };

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || typeof row !== "object") {
      hashText(`@${i}|`);
      continue;
    }
    const keys = Object.keys(row).sort();
    for (const key of keys) {
      schemaSet.add(String(key).toUpperCase());
      hashText(`${key}=`);
      hashText(normalizeValueForSignature(row[key]));
      hashText("|");
    }
    hashText(`#${i}`);
  }

  const schema = Array.from(schemaSet).sort();
  hashText("::SCHEMA::");
  for (const key of schema) {
    hashText(key);
    hashText("|");
  }
  return `${rows.length}:${schema.length}:${(hash >>> 0).toString(16)}`;
}

async function getSheetCompareSummaryAsync(rawSheet) {
  const sheet = String(rawSheet || "").trim();
  if (!sheet) {
    const error = new Error("sheet is required.");
    error.statusCode = 400;
    throw error;
  }
  const isLoginSheet = sheet.toUpperCase() === LOGIN_SHEET;
  const resolvedSheet = isLoginSheet ? LOGIN_SHEET : normalizeMunicipalitySheetName(sheet);
  const localSheet = readLocalSheetData(resolvedSheet, isLoginSheet);
  const upstreamSheet = await getSheetDataAsync(sheet, { preferUpstream: true });
  const localRows = localSheet && Array.isArray(localSheet.data) ? localSheet.data : [];
  const upstreamRows = Array.isArray(upstreamSheet.data) ? upstreamSheet.data : [];
  const localSignature = createRowsSignature(localRows);
  const upstreamSignature = createRowsSignature(upstreamRows);
  return {
    resolvedSheet,
    changed: localSignature !== upstreamSignature,
    local: {
      signature: localSignature,
      rowCount: localRows.length,
      hasLocalFile: Boolean(localSheet),
      localFile: localSheet ? path.relative(rootDir, localSheet.filePath) : "",
    },
    upstream: {
      signature: upstreamSignature,
      rowCount: upstreamRows.length,
      upstreamUrl: upstreamSheet.upstreamUrl || "",
    },
  };
}

function fetchJsonFromUrl(url, redirectsRemaining) {
  const remaining =
    Number.isInteger(redirectsRemaining) && redirectsRemaining >= 0
      ? redirectsRemaining
      : 5;
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;
    const request = transport.get(
      parsed,
      { headers: { Accept: "application/json" } },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          const statusCode = Number(response.statusCode || 0);
          if ([301, 302, 303, 307, 308].includes(statusCode)) {
            if (remaining <= 0) {
              reject({
                statusCode,
                message: "Too many upstream redirects.",
              });
              return;
            }
            const location = String(response.headers.location || "").trim();
            if (!location) {
              reject({
                statusCode,
                message: "Upstream redirect missing location header.",
              });
              return;
            }
            const nextUrl = new URL(location, parsed).toString();
            fetchJsonFromUrl(nextUrl, remaining - 1).then(resolve).catch(reject);
            return;
          }
          if (statusCode < 200 || statusCode >= 300) {
            reject({
              statusCode,
              message: `Upstream request failed with status ${statusCode}.`,
            });
            return;
          }

          try {
            const parsedBody = JSON.parse(body);
            resolve(parsedBody);
          } catch (_) {
            reject({
              statusCode,
              message: "Upstream returned invalid JSON.",
            });
          }
        });
      }
    );

    request.on("error", (error) => {
      reject({
        statusCode: 0,
        message:
          error && error.message
            ? error.message
            : "Unable to reach upstream service.",
      });
    });
  });
}

async function getSheetDataAsync(rawSheet, options) {
  const config = {
    preferUpstream: false,
    ...options,
  };
  const sheet = String(rawSheet || "").trim();
  if (!sheet) {
    throw new Error("sheet is required.");
  }
  const isLoginSheet = sheet.toUpperCase() === LOGIN_SHEET;
  const resolvedSheet = isLoginSheet ? LOGIN_SHEET : normalizeMunicipalitySheetName(sheet);

  if (!config.preferUpstream) {
    const localSheet = readLocalSheetData(resolvedSheet, isLoginSheet);
    if (localSheet && Array.isArray(localSheet.data)) {
      return {
        data: localSheet.data,
        source: "local",
        resolvedSheet,
        localFile: path.relative(rootDir, localSheet.filePath),
      };
    }
  }

  const upstreamCandidates = isLoginSheet
    ? [resolvedSheet]
    : buildSheetNameCandidates(resolvedSheet, false);
  let lastError = null;

  for (let index = 0; index < upstreamCandidates.length; index += 1) {
    const candidate = String(upstreamCandidates[index] || "").trim();
    if (!candidate) {
      continue;
    }
    const upstreamUrl = isLoginSheet
      ? `${MLS_API_BASE_URL}?sheet=${encodeURIComponent(candidate)}`
      : `${MUNICIPALITY_API_BASE_URL}?sheet=${encodeURIComponent(
          candidate
        )}&sig=${encodeURIComponent(MUNICIPALITY_API_SIG)}`;
    try {
      const payload = await fetchJsonFromUrl(upstreamUrl);
      const data = extractSheetData(payload);
      if (!data) {
        const error = new Error("Invalid upstream JSON format.");
        error.statusCode = 502;
        throw error;
      }

      const isLastCandidate = index >= upstreamCandidates.length - 1;
      if (Array.isArray(data) && data.length === 0 && !isLastCandidate) {
        continue;
      }

      return {
        data,
        source: "upstream",
        resolvedSheet: candidate,
        upstreamUrl,
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  const error = new Error("Unable to fetch sheet from upstream.");
  error.statusCode = 502;
  throw error;
}

function findUserById(records, id) {
  const target = String(id || "").trim();
  if (!target || !Array.isArray(records)) {
    return null;
  }
  return (
    records.find((record) => String(record && record.ID ? record.ID : "").trim() === target) ||
    null
  );
}

function ensureCsrDbDir() {
  try {
    if (!fs.existsSync(csrDbDirPath)) {
      fs.mkdirSync(csrDbDirPath, { recursive: true });
    }
  } catch (_) {
    // Ignore directory creation errors here; callers handle read/write failures.
  }
}

function ensureDownloadsDir() {
  try {
    if (!fs.existsSync(downloadsDirPath)) {
      fs.mkdirSync(downloadsDirPath, { recursive: true });
    }
  } catch (_) {
    // Ignore directory creation errors here; callers handle read/write failures.
  }
}

function sanitizeMunicipalityName(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function toMunicipalityFileBaseName(value) {
  return sanitizeMunicipalityName(value)
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toLegacyMunicipalityFileBaseName(value) {
  return sanitizeMunicipalityName(value).replace(/[^\w.-]+/g, "_");
}

function normalizeCsrDatasetKind(value) {
  return String(value || "").trim().toLowerCase() === "scsr" ? "scsr" : "csr";
}

function getCsrDbFilePath(municipality, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  const safe = toMunicipalityFileBaseName(municipality);
  if (!safe) {
    return null;
  }
  return path.resolve(csrDbDirPath, `${datasetKind}_${safe}.json`);
}

function getLegacyCsrDbFilePath(municipality, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  const safe = toLegacyMunicipalityFileBaseName(municipality);
  if (!safe) {
    return null;
  }
  return path.resolve(csrDbDirPath, `${datasetKind}_${safe}.json`);
}

function getUnprefixedCsrDbFilePath(municipality) {
  const safe = toMunicipalityFileBaseName(municipality);
  if (!safe) {
    return null;
  }
  return path.resolve(csrDbDirPath, `${safe}.json`);
}

function getUnprefixedLegacyCsrDbFilePath(municipality) {
  const safe = toLegacyMunicipalityFileBaseName(municipality);
  if (!safe) {
    return null;
  }
  return path.resolve(csrDbDirPath, `${safe}.json`);
}

function migrateLegacyMunicipalityFilePath(primaryPath, legacyPath) {
  if (!primaryPath || !legacyPath || primaryPath === legacyPath) {
    return;
  }
  try {
    if (!fs.existsSync(primaryPath) && fs.existsSync(legacyPath)) {
      fs.renameSync(legacyPath, primaryPath);
    }
  } catch (_) {
    // Ignore migration failures and continue with fallback behavior.
  }
}

function resolveCsrDbReadFilePath(municipality, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  const primaryPath = getCsrDbFilePath(municipality, datasetKind);
  const legacyPaths = [getLegacyCsrDbFilePath(municipality, datasetKind)];
  if (datasetKind === "csr") {
    legacyPaths.push(getUnprefixedCsrDbFilePath(municipality));
    legacyPaths.push(getUnprefixedLegacyCsrDbFilePath(municipality));
  }
  legacyPaths.forEach((legacyPath) => {
    migrateLegacyMunicipalityFilePath(primaryPath, legacyPath);
  });

  if (primaryPath && fs.existsSync(primaryPath)) {
    return primaryPath;
  }
  for (const legacyPath of legacyPaths) {
    if (legacyPath && fs.existsSync(legacyPath)) {
      return legacyPath;
    }
  }
  return primaryPath;
}

async function readCsrRecordsByMunicipalityAsync(municipality, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  ensureCsrDbDir();
  const filePath = resolveCsrDbReadFilePath(municipality, datasetKind);
  if (!filePath) {
    return [];
  }

  try {
    await fsp.access(filePath);
    const raw = await fsp.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function writeCsrRecordsByMunicipalityAsync(municipality, records, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  ensureCsrDbDir();
  const filePath = getCsrDbFilePath(municipality, datasetKind);
  const legacyPaths = [getLegacyCsrDbFilePath(municipality, datasetKind)];
  if (datasetKind === "csr") {
    legacyPaths.push(getUnprefixedCsrDbFilePath(municipality));
    legacyPaths.push(getUnprefixedLegacyCsrDbFilePath(municipality));
  }
  legacyPaths.forEach((legacyPath) => {
    migrateLegacyMunicipalityFilePath(filePath, legacyPath);
  });
  if (!filePath) {
    throw new Error("Invalid municipality.");
  }
  await fsp.writeFile(filePath, JSON.stringify(records || [], null, 2), "utf8");
}

async function ensureCsrDbFileByMunicipalityAsync(municipality, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  ensureCsrDbDir();
  const filePath = getCsrDbFilePath(municipality, datasetKind);
  const legacyPaths = [getLegacyCsrDbFilePath(municipality, datasetKind)];
  if (datasetKind === "csr") {
    legacyPaths.push(getUnprefixedCsrDbFilePath(municipality));
    legacyPaths.push(getUnprefixedLegacyCsrDbFilePath(municipality));
  }
  legacyPaths.forEach((legacyPath) => {
    migrateLegacyMunicipalityFilePath(filePath, legacyPath);
  });
  if (!filePath) {
    return false;
  }
  try {
    await fsp.access(filePath);
    return true;
  } catch (_) {
    await fsp.writeFile(filePath, "[]\n", "utf8");
    return true;
  }
}

async function upsertCsrRecordByMunicipalityAsync(municipality, record, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  const records = await readCsrRecordsByMunicipalityAsync(municipality, datasetKind);
  const csrId = String(record && record.csrId ? record.csrId : "").trim();
  if (!csrId) {
    throw new Error("Missing csrId.");
  }

  const index = records.findIndex(
    (item) => String(item && item.csrId ? item.csrId : "") === csrId
  );
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  await writeCsrRecordsByMunicipalityAsync(municipality, records, datasetKind);
  return record;
}

async function cleanupOrphanCsrRecordsByMunicipalityAsync(
  municipality,
  validHouseholdIds,
  kind
) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  ensureCsrDbDir();
  const filePath = resolveCsrDbReadFilePath(municipality, datasetKind);
  if (!filePath) {
    return {
      municipality,
      removedCount: 0,
      keptCount: 0,
      totalCount: 0,
    };
  }

  let records = [];
  try {
    await fsp.access(filePath);
    const raw = await fsp.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    records = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    records = [];
  }

  const validSet = new Set(
    Array.from(validHouseholdIds || [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );

  const kept = [];
  let removedCount = 0;
  for (const record of records) {
    const hhid = String(
      record &&
      record.cardData &&
      record.cardData.hhid
        ? record.cardData.hhid
        : ""
    ).trim();

    if (!hhid || validSet.has(hhid)) {
      kept.push(record);
    } else {
      removedCount += 1;
    }
  }

  if (removedCount > 0) {
    const writePath = getCsrDbFilePath(municipality, datasetKind) || filePath;
    await fsp.writeFile(writePath, JSON.stringify(kept || [], null, 2), "utf8");
  }

  return {
    municipality,
    removedCount,
    keptCount: kept.length,
    totalCount: records.length,
  };
}

function enqueueMunicipalityWrite(municipality, task, kind) {
  const datasetKind = normalizeCsrDatasetKind(kind);
  const key = `${datasetKind}:${sanitizeMunicipalityName(municipality)}`;
  const previous = municipalityWriteQueues.get(key) || Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => task());

  municipalityWriteQueues.set(
    key,
    next.finally(() => {
      if (municipalityWriteQueues.get(key) === next) {
        municipalityWriteQueues.delete(key);
      }
    })
  );
  return next;
}

async function findCsrRecordByIdAsync(csrId, municipality, options) {
  const config = {
    restrictToMunicipality: false,
    kind: "csr",
    ...options,
  };
  const datasetKind = normalizeCsrDatasetKind(config.kind);
  const id = String(csrId || "").trim();
  if (!id) {
    return null;
  }

  if (municipality) {
    const scopedRecords = await readCsrRecordsByMunicipalityAsync(
      municipality,
      datasetKind
    );
    const scoped = scopedRecords.find(
      (record) => String(record && record.csrId ? record.csrId : "") === id
    );
    if (scoped) {
      return scoped;
    }
    if (config.restrictToMunicipality) {
      return null;
    }
  }

  ensureCsrDbDir();
  try {
    const kindPrefix = `${datasetKind}_`;
    const files = (await fsp.readdir(csrDbDirPath)).filter((name) => {
      const lower = String(name || "").toLowerCase();
      if (!lower.endsWith(".json")) {
        return false;
      }
      if (datasetKind === "csr") {
        return lower.startsWith("csr_") || !lower.startsWith("scsr_");
      }
      return lower.startsWith(kindPrefix);
    });
    for (const file of files) {
      const filePath = path.resolve(csrDbDirPath, file);
      const raw = await fsp.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        continue;
      }
      const match = parsed.find(
        (record) => String(record && record.csrId ? record.csrId : "") === id
      );
      if (match) {
        return match;
      }
    }
  } catch (_) {
    return null;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
  const pathname = requestUrl.pathname;

  if (pathname === "/api/session/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
    });
    res.write("\n");

    sseClients.add(res);
    sendSseEvent(res, "session", { ok: true, session: readSession() });

    req.on("close", () => {
      sseClients.delete(res);
    });
    return;
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    parseJsonBody(req)
      .then(async (body) => {
        const id = String(body && body.id ? body.id : "").trim();
        const municipality = sanitizeMunicipalityName(body && body.municipality);
        if (!id || !municipality) {
          sendJson(res, 400, { ok: false, error: "id and municipality are required." });
          return;
        }

        const mls = await getSheetDataAsync(LOGIN_SHEET, { preferUpstream: false });
        const userRecord = findUserById(mls.data, id);
        if (!userRecord) {
          sendJson(res, 404, { ok: false, error: "ID not found in MLS records." });
          return;
        }

        const assignedMunicipality = normalizeMunicipalitySheetName(
          String(userRecord.MUNICIPALITY || "")
        );
        if (!assignedMunicipality) {
          sendJson(res, 400, { ok: false, error: "No municipality is assigned to this ID." });
          return;
        }
        if (assignedMunicipality !== municipality) {
          sendJson(res, 403, { ok: false, error: "Selected municipality does not match this ID." });
          return;
        }

        await ensureCsrDbFileByMunicipalityAsync(municipality, "csr");

        const session = writeSession({
          loggedIn: true,
          id,
          municipality,
          files: [`${toSheetJsonBaseName(LOGIN_SHEET)}.json`, `${toSheetJsonBaseName(municipality)}.json`],
          csrDbInitialized: true,
          loggedInAt: new Date().toISOString(),
          name: String(
            userRecord.NAMES || userRecord.NAME || userRecord.FULL_NAME || ""
          ).trim(),
        });
        broadcastSessionState();
        sendJson(res, 200, {
          ok: true,
          session,
          user: {
            id,
            municipality,
            name: String(session.name || "").trim(),
          },
        });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        const status = Number(error && error.statusCode) || (isSyntaxError ? 400 : 500);
        sendJson(res, status, {
          ok: false,
          error: isSyntaxError ? "Invalid JSON payload." : "Unable to complete login.",
        });
      });
    return;
  }

  if (pathname === "/api/session" && req.method === "GET") {
    const session = readSession();
    sendJson(res, 200, { ok: true, session: session });
    return;
  }

  if (pathname === "/api/session" && req.method === "POST") {
    if (USE_SERVER_AUTH) {
      sendJson(res, 403, { ok: false, error: "Session write is disabled in secure mode." });
      return;
    }
    parseJsonBody(req)
      .then((body) => {
        const payload = body && typeof body === "object" ? body : {};
        const session = writeSession({
          loggedIn: payload.loggedIn === true,
          id: String(payload.id || "").trim(),
          municipality: sanitizeMunicipalityName(payload.municipality),
          files: Array.isArray(payload.files) ? payload.files : [],
          loggedInAt: payload.loggedInAt || new Date().toISOString(),
          csrDbInitialized: payload.csrDbInitialized === true,
        });
        broadcastSessionState();
        sendJson(res, 200, { ok: true, session: session });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        sendJson(
          res,
          isSyntaxError ? 400 : 500,
          {
            ok: false,
            error: isSyntaxError
              ? "Invalid JSON payload."
              : "Unable to save CSR record.",
          }
        );
      });
    return;
  }

  if (pathname === "/api/session" && req.method === "DELETE") {
    clearSession();
    broadcastSessionState();
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/runtime/diagnostics" && req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      diagnostics: {
        port,
        pid: process.pid,
        dataRootDir,
        downloadsDirPath,
        csrDbDirPath,
        sessionFilePath,
      },
    });
    return;
  }

  if (pathname === "/api/downloads/verify" && req.method === "POST") {
    parseJsonBody(req)
      .then(async (body) => {
        ensureDownloadsDir();
        const inputFiles = Array.isArray(body && body.files) ? body.files : [];
        const normalized = inputFiles
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        const present = [];
        const missing = [];

        for (const fileName of normalized) {
          const safeBase = toSheetJsonBaseName(fileName).replace(/\.json$/i, "");
          if (!safeBase) {
            missing.push(fileName);
            continue;
          }
          const canonicalFileName = `${safeBase}.json`;
          const canonicalPath = path.resolve(downloadsDirPath, canonicalFileName);
          const legacyBase = toLegacySheetJsonBaseName(safeBase).replace(/\.json$/i, "");
          const legacyFileName = legacyBase ? `${legacyBase}.json` : "";
          const legacyPath = legacyFileName
            ? path.resolve(downloadsDirPath, legacyFileName)
            : "";
          if (fs.existsSync(canonicalPath) || (legacyPath && fs.existsSync(legacyPath))) {
            present.push(canonicalFileName);
          } else {
            missing.push(canonicalFileName);
          }
        }

        sendJson(res, 200, {
          ok: true,
          allPresent: missing.length === 0,
          present,
          missing,
        });
      })
      .catch(() => {
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
      });
    return;
  }

  if (pathname === "/api/downloads/sheet" && req.method === "POST") {
    // Municipality datasets can exceed the default JSON parser limit.
    // Allow a larger request body for this endpoint.
    parseJsonBody(req, { maxBytes: 100_000_000 })
      .then(async (body) => {
        ensureDownloadsDir();
        const sheetName = String(body && body.sheetName ? body.sheetName : "").trim();
        const safeBase = toSheetJsonBaseName(sheetName).replace(/\.json$/i, "");
        if (!safeBase) {
          sendJson(res, 400, { ok: false, error: "sheetName is required." });
          return;
        }
        const rows = body ? body.data : null;
        if (!Array.isArray(rows)) {
          sendJson(res, 400, { ok: false, error: "data must be an array." });
          return;
        }
        const safeFileName = `${safeBase}.json`;
        const targetPath = path.resolve(downloadsDirPath, safeFileName);
        await fsp.writeFile(targetPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
        sendJson(res, 200, {
          ok: true,
          fileName: safeFileName,
          directory: downloadsDirPath,
          path: targetPath,
        });
      })
      .catch((error) => {
        const message = String((error && error.message) || "");
        const isSyntaxError = error && error.name === "SyntaxError";
        const isPayloadTooLarge = /too large/i.test(message);
        const status = isSyntaxError ? 400 : isPayloadTooLarge ? 413 : 500;
        const responsePayload = {
          ok: false,
          error: isSyntaxError
            ? "Invalid JSON payload."
            : isPayloadTooLarge
              ? "Request payload too large."
              : "Unable to write municipality JSON file.",
        };
        if (error && error.code) {
          responsePayload.code = String(error.code);
        }
        if (message) {
          responsePayload.detail = message;
        }
        sendJson(res, status, responsePayload);
      });
    return;
  }

  if (pathname === "/api/csr" && req.method === "GET") {
    const datasetKind = normalizeCsrDatasetKind(
      requestUrl.searchParams.get("kind")
    );
    let municipality = sanitizeMunicipalityName(
      requestUrl.searchParams.get("municipality")
    );
    const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
    if (USE_SERVER_AUTH && !session) {
      sendAuthRequired(res);
      return;
    }
    if (USE_SERVER_AUTH) {
      if (municipality && municipality !== session.municipality) {
        sendMunicipalityForbidden(res);
        return;
      }
      municipality = session.municipality;
    }
    if (!municipality) {
      sendJson(res, 400, { ok: false, error: "municipality is required." });
      return;
    }
    readCsrRecordsByMunicipalityAsync(municipality, datasetKind)
      .then((records) => {
        sendJson(res, 200, { ok: true, municipality, kind: datasetKind, records });
      })
      .catch(() => {
        sendJson(res, 200, { ok: true, municipality, kind: datasetKind, records: [] });
      });
    return;
  }

  if (pathname === "/api/csr/status" && req.method === "GET") {
    const datasetKind = normalizeCsrDatasetKind(
      requestUrl.searchParams.get("kind")
    );
    let municipality = sanitizeMunicipalityName(
      requestUrl.searchParams.get("municipality")
    );
    const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
    if (USE_SERVER_AUTH && !session) {
      sendAuthRequired(res);
      return;
    }
    if (USE_SERVER_AUTH) {
      if (municipality && municipality !== session.municipality) {
        sendMunicipalityForbidden(res);
        return;
      }
      municipality = session.municipality;
    }
    if (!municipality) {
      sendJson(res, 400, { ok: false, error: "municipality is required." });
      return;
    }
    const filePath = getCsrDbFilePath(municipality, datasetKind);
    Promise.all([
      filePath ? fsp.access(filePath).then(() => true).catch(() => false) : false,
    ])
      .then(([fileExists]) => {
        sendJson(res, 200, {
          ok: true,
          municipality,
          kind: datasetKind,
          fileExists,
          backupExists: false,
        });
      })
      .catch(() => {
        sendJson(res, 200, {
          ok: true,
          municipality,
          kind: datasetKind,
          fileExists: false,
          backupExists: false,
        });
      });
    return;
  }

  if (pathname === "/api/csr/by-id" && req.method === "GET") {
    const datasetKind = normalizeCsrDatasetKind(
      requestUrl.searchParams.get("kind")
    );
    const csrId = String(requestUrl.searchParams.get("id") || "").trim();
    let municipality = sanitizeMunicipalityName(
      requestUrl.searchParams.get("municipality")
    );
    const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
    if (USE_SERVER_AUTH && !session) {
      sendAuthRequired(res);
      return;
    }
    if (USE_SERVER_AUTH) {
      if (municipality && municipality !== session.municipality) {
        sendMunicipalityForbidden(res);
        return;
      }
      municipality = session.municipality;
    }
    if (!csrId) {
      sendJson(res, 400, { ok: false, error: "id is required." });
      return;
    }
    findCsrRecordByIdAsync(csrId, municipality, {
      restrictToMunicipality: USE_SERVER_AUTH,
      kind: datasetKind,
    })
      .then((record) => {
        sendJson(res, 200, {
          ok: true,
          kind: datasetKind,
          record: record || null,
        });
      })
      .catch(() => {
        sendJson(res, 200, { ok: true, kind: datasetKind, record: null });
      });
    return;
  }

  if (pathname === "/api/csr" && req.method === "POST") {
    parseJsonBody(req)
      .then((body) => {
        const datasetKind = normalizeCsrDatasetKind(body && body.kind);
        let municipality = sanitizeMunicipalityName(body && body.municipality);
        const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
        if (USE_SERVER_AUTH && !session) {
          sendAuthRequired(res);
          return;
        }
        if (USE_SERVER_AUTH) {
          if (municipality && municipality !== session.municipality) {
            sendMunicipalityForbidden(res);
            return;
          }
          municipality = session.municipality;
        }
        const record = body && body.record;
        if (!municipality || !record || typeof record !== "object") {
          sendJson(res, 400, {
            ok: false,
            error: "municipality and record are required.",
          });
          return;
        }
        return enqueueMunicipalityWrite(
          municipality,
          () => upsertCsrRecordByMunicipalityAsync(municipality, record, datasetKind),
          datasetKind
        ).then((saved) => {
          sendJson(res, 200, {
            ok: true,
            municipality,
            kind: datasetKind,
            record: saved,
          });
        });
      })
      .catch(() => {
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
      });
    return;
  }

  if (pathname === "/api/csr/cleanup" && req.method === "POST") {
    parseJsonBody(req)
      .then((body) => {
        const datasetKind = normalizeCsrDatasetKind(body && body.kind);
        let municipality = sanitizeMunicipalityName(body && body.municipality);
        const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
        if (USE_SERVER_AUTH && !session) {
          sendAuthRequired(res);
          return;
        }
        if (USE_SERVER_AUTH) {
          if (municipality && municipality !== session.municipality) {
            sendMunicipalityForbidden(res);
            return;
          }
          municipality = session.municipality;
        }
        const validHouseholdIds = Array.isArray(body && body.validHouseholdIds)
          ? body.validHouseholdIds
          : null;
        if (!municipality || !validHouseholdIds) {
          sendJson(res, 400, {
            ok: false,
            error: "municipality and validHouseholdIds are required.",
          });
          return;
        }
        return enqueueMunicipalityWrite(
          municipality,
          () =>
            cleanupOrphanCsrRecordsByMunicipalityAsync(
              municipality,
              validHouseholdIds,
              datasetKind
            ),
          datasetKind
        ).then((result) => {
          sendJson(res, 200, { ok: true, kind: datasetKind, ...result });
        });
      })
      .catch(() => {
        sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
      });
    return;
  }

  if (pathname === "/api/csr/ensure" && req.method === "POST") {
    parseJsonBody(req)
      .then((body) => {
        const datasetKind = normalizeCsrDatasetKind(body && body.kind);
        let municipality = sanitizeMunicipalityName(body && body.municipality);
        const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
        if (USE_SERVER_AUTH && !session) {
          sendAuthRequired(res);
          return;
        }
        if (USE_SERVER_AUTH) {
          if (municipality && municipality !== session.municipality) {
            sendMunicipalityForbidden(res);
            return;
          }
          municipality = session.municipality;
        }
        if (!municipality) {
          sendJson(res, 400, { ok: false, error: "municipality is required." });
          return;
        }
        return enqueueMunicipalityWrite(municipality, async () => {
          const ensured = await ensureCsrDbFileByMunicipalityAsync(
            municipality,
            datasetKind
          );
          if (!ensured) {
            throw new Error("Invalid municipality.");
          }
          return { ensured: true };
        }, datasetKind).then((result) => {
          sendJson(res, 200, {
            ok: true,
            municipality,
            kind: datasetKind,
            ensured: !!(result && result.ensured),
          });
        });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        const message = String((error && error.message) || "").trim();
        const invalidMunicipality = message === "Invalid municipality.";
        if (isSyntaxError) {
          sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
          return;
        }
        if (invalidMunicipality) {
          sendJson(res, 400, { ok: false, error: "Invalid municipality." });
          return;
        }
        sendJson(res, 500, { ok: false, error: "Unable to ensure municipality DB file." });
      });
    return;
  }

  if (pathname === "/api/export/csr-pdf" && req.method === "POST") {
    parseJsonBody(req, { maxBytes: 50_000_000 })
      .then(async (body) => {
        const fileNameInput = String(body && body.fileName ? body.fileName : "").trim();
        const desktopDir = path.resolve(os.homedir(), "Desktop");
        const reportRootDir = path.resolve(desktopDir, "Social Case Report");
        const csrDir = path.resolve(reportRootDir, "CSR");
        const safeBaseName = sanitizePdfFileName(fileNameInput).replace(/\.pdf$/i, "");
        const safeFileName = `${safeBaseName}.pdf`;
        const targetPath = path.resolve(csrDir, safeFileName);
        if (!targetPath.startsWith(csrDir)) {
          sendJson(res, 400, { ok: false, error: "Invalid file name." });
          return;
        }
        await fsp.mkdir(csrDir, { recursive: true });
        const payload = body && body.payload && typeof body.payload === "object"
          ? body.payload
          : null;
        if (payload) {
          const token = createExportToken();
          csrExportPayloadStore.set(token, payload);
          try {
            const url = `http://127.0.0.1:${port}/main/csr-template.html?embedded=1&exportToken=${encodeURIComponent(token)}&t=${Date.now()}`;
            await renderPdfWithPlaywright(url, targetPath);
          } finally {
            csrExportPayloadStore.delete(token);
          }
        } else {
          const base64Pdf = String(body && body.base64Pdf ? body.base64Pdf : "").trim();
          if (!base64Pdf) {
            sendJson(res, 400, { ok: false, error: "payload or base64Pdf is required." });
            return;
          }
          const pdfBuffer = Buffer.from(base64Pdf, "base64");
          if (!pdfBuffer || !pdfBuffer.length) {
            sendJson(res, 400, { ok: false, error: "Invalid PDF payload." });
            return;
          }
          await fsp.writeFile(targetPath, pdfBuffer);
        }
        sendJson(res, 200, {
          ok: true,
          fileName: safeFileName,
          directory: csrDir,
          path: targetPath,
        });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        const isTooLarge =
          error && String(error.message || "").toLowerCase().includes("too large");
        const errorMessage = String((error && error.message) || "").trim();
        if (isSyntaxError) {
          sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
          return;
        }
        if (isTooLarge) {
          sendJson(res, 413, { ok: false, error: "PDF payload too large." });
          return;
        }
        console.error("PDF export error:", error);
        sendJson(res, 500, {
          ok: false,
          error: errorMessage
            ? `Unable to save PDF export: ${errorMessage}`
            : "Unable to save PDF export.",
        });
      });
    return;
  }

  if (pathname === "/api/export/scsr-pdf" && req.method === "POST") {
    parseJsonBody(req, { maxBytes: 50_000_000 })
      .then(async (body) => {
        const fileNameInput = String(body && body.fileName ? body.fileName : "").trim();
        const desktopDir = path.resolve(os.homedir(), "Desktop");
        const reportRootDir = path.resolve(desktopDir, "Social Case Report");
        const scsrDir = path.resolve(reportRootDir, "SCSR");
        const safeBaseName = sanitizePdfFileName(fileNameInput).replace(/\.pdf$/i, "");
        const safeFileName = `${safeBaseName}.pdf`;
        const targetPath = path.resolve(scsrDir, safeFileName);
        if (!targetPath.startsWith(scsrDir)) {
          sendJson(res, 400, { ok: false, error: "Invalid file name." });
          return;
        }
        await fsp.mkdir(scsrDir, { recursive: true });
        const payload = body && body.payload && typeof body.payload === "object"
          ? body.payload
          : null;
        if (payload) {
          const token = createExportToken();
          csrExportPayloadStore.set(token, payload);
          try {
            const url = `http://127.0.0.1:${port}/main/scsr-template.html?embedded=1&printMode=1&exportToken=${encodeURIComponent(token)}&t=${Date.now()}`;
            await renderPdfWithPlaywright(url, targetPath);
          } finally {
            csrExportPayloadStore.delete(token);
          }
        } else {
          const base64Pdf = String(body && body.base64Pdf ? body.base64Pdf : "").trim();
          if (!base64Pdf) {
            sendJson(res, 400, { ok: false, error: "payload or base64Pdf is required." });
            return;
          }
          const pdfBuffer = Buffer.from(base64Pdf, "base64");
          if (!pdfBuffer || !pdfBuffer.length) {
            sendJson(res, 400, { ok: false, error: "Invalid PDF payload." });
            return;
          }
          await fsp.writeFile(targetPath, pdfBuffer);
        }
        sendJson(res, 200, {
          ok: true,
          fileName: safeFileName,
          directory: scsrDir,
          path: targetPath,
        });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        const isTooLarge =
          error && String(error.message || "").toLowerCase().includes("too large");
        const errorMessage = String((error && error.message) || "").trim();
        if (isSyntaxError) {
          sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
          return;
        }
        if (isTooLarge) {
          sendJson(res, 413, { ok: false, error: "PDF payload too large." });
          return;
        }
        console.error("SCSR PDF export error:", error);
        sendJson(res, 500, {
          ok: false,
          error: errorMessage
            ? `Unable to save PDF export: ${errorMessage}`
            : "Unable to save PDF export.",
        });
      });
    return;
  }

  if (pathname === "/api/export/payload" && req.method === "GET") {
    const token = String(requestUrl.searchParams.get("token") || "").trim();
    if (!token) {
      sendJson(res, 400, { ok: false, error: "token is required." });
      return;
    }
    const payload = csrExportPayloadStore.get(token);
    if (!payload) {
      sendJson(res, 404, { ok: false, error: "Export payload not found." });
      return;
    }
    sendJson(res, 200, { ok: true, payload });
    return;
  }

  if (pathname === "/api/export/payload" && req.method === "POST") {
    parseJsonBody(req, { maxBytes: 10_000_000 })
      .then((body) => {
        const payload = body && body.payload && typeof body.payload === "object"
          ? body.payload
          : null;
        const template = String(body && body.template ? body.template : "").trim().toLowerCase();
        const templateFile = template === "scsr" ? "scsr-template.html" : "csr-template.html";
        if (!payload) {
          sendJson(res, 400, { ok: false, error: "payload is required." });
          return;
        }
        const token = createExportToken();
        csrExportPayloadStore.set(token, payload);
        // Auto-expire to keep memory bounded for frequent preview opens.
        setTimeout(() => {
          csrExportPayloadStore.delete(token);
        }, 10 * 60 * 1000);
        sendJson(res, 200, {
          ok: true,
          token,
          url: `http://127.0.0.1:${port}/main/${templateFile}?embedded=1&printMode=1&exportToken=${encodeURIComponent(token)}&t=${Date.now()}`,
        });
      })
      .catch((error) => {
        const isSyntaxError = error && error.name === "SyntaxError";
        const isTooLarge =
          error && String(error.message || "").toLowerCase().includes("too large");
        if (isSyntaxError) {
          sendJson(res, 400, { ok: false, error: "Invalid JSON payload." });
          return;
        }
        if (isTooLarge) {
          sendJson(res, 413, { ok: false, error: "Preview payload too large." });
          return;
        }
        sendJson(res, 500, { ok: false, error: "Unable to prepare preview payload." });
      });
    return;
  }

  if (pathname === "/api/sheet" && req.method === "GET") {
    if (!USE_SERVER_SHEET_PROXY) {
      sendJson(res, 404, { ok: false, error: "Sheet proxy is disabled." });
      return;
    }
    const rawSheet = String(requestUrl.searchParams.get("sheet") || "").trim();
    if (!rawSheet) {
      sendJson(res, 400, { ok: false, error: "sheet is required." });
      return;
    }
    const isLoginSheet = rawSheet.toUpperCase() === LOGIN_SHEET;
    const resolvedSheet = isLoginSheet
      ? LOGIN_SHEET
      : normalizeMunicipalitySheetName(rawSheet);
    const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
    if (USE_SERVER_AUTH && !isLoginSheet && !session) {
      sendAuthRequired(res);
      return;
    }
    if (USE_SERVER_AUTH && !isLoginSheet && resolvedSheet !== session.municipality) {
      sendMunicipalityForbidden(res);
      return;
    }

    const preferUpstream =
      requestUrl.searchParams.get("preferUpstream") === "1" ||
      String(requestUrl.searchParams.get("source") || "").trim().toLowerCase() ===
        "upstream";

    getSheetDataAsync(rawSheet, { preferUpstream })
      .then((sheet) => {
        sendJson(res, 200, {
          ok: true,
          sheet: rawSheet,
          resolvedSheet: sheet.resolvedSheet,
          source: sheet.source,
          localFile: sheet.localFile,
          data: sheet.data,
        });
      })
      .catch((error) => {
        const status = Number(error && error.statusCode) || 502;
        const message =
          error && error.message
            ? error.message
            : "Unable to fetch sheet from upstream.";
        sendJson(res, status, {
          ok: false,
          error: message,
          sheet: rawSheet,
          resolvedSheet,
          upstreamUrl: error && error.upstreamUrl ? error.upstreamUrl : undefined,
        });
      });
    return;
  }

  if (pathname === "/api/sheet/compare" && req.method === "GET") {
    if (!USE_SERVER_SHEET_PROXY) {
      sendJson(res, 404, { ok: false, error: "Sheet proxy is disabled." });
      return;
    }
    const rawSheet = String(requestUrl.searchParams.get("sheet") || "").trim();
    if (!rawSheet) {
      sendJson(res, 400, { ok: false, error: "sheet is required." });
      return;
    }
    const isLoginSheet = rawSheet.toUpperCase() === LOGIN_SHEET;
    const resolvedSheet = isLoginSheet
      ? LOGIN_SHEET
      : normalizeMunicipalitySheetName(rawSheet);
    const session = USE_SERVER_AUTH ? getAuthenticatedSession() : null;
    if (USE_SERVER_AUTH && !isLoginSheet && !session) {
      sendAuthRequired(res);
      return;
    }
    if (USE_SERVER_AUTH && !isLoginSheet && resolvedSheet !== session.municipality) {
      sendMunicipalityForbidden(res);
      return;
    }

    getSheetCompareSummaryAsync(rawSheet)
      .then((summary) => {
        sendJson(res, 200, {
          ok: true,
          sheet: rawSheet,
          resolvedSheet: summary.resolvedSheet,
          changed: summary.changed,
          local: summary.local,
          upstream: summary.upstream,
        });
      })
      .catch((error) => {
        const status = Number(error && error.statusCode) || 502;
        const message =
          error && error.message
            ? error.message
            : "Unable to compare sheet data.";
        sendJson(res, status, {
          ok: false,
          error: message,
          sheet: rawSheet,
          resolvedSheet,
        });
      });
    return;
  }

  const filePath = resolveFilePath(pathname || "/");
  if (!filePath) {
    sendNotFound(res);
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      sendNotFound(res);
      return;
    }

    if (stats.isDirectory()) {
      sendNotFound(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => sendNotFound(res));
    stream.pipe(res);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CSR local server running at http://127.0.0.1:${port}/main/index.html`);
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close existing server or change port.`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

fs.watchFile(sessionFilePath, { interval: 1000 }, () => {
  broadcastSessionState();
});

async function closeExportBrowserIfOpen() {
  try {
    if (!exportBrowserPromise) {
      return;
    }
    const browser = await exportBrowserPromise;
    exportBrowserPromise = null;
    await browser.close();
  } catch (_) {
    exportBrowserPromise = null;
  }
}

process.on("SIGINT", async () => {
  await closeExportBrowserIfOpen();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeExportBrowserIfOpen();
  process.exit(0);
});
