const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const { fork } = require("child_process");
const http = require("http");
const net = require("net");
const path = require("path");
const fs = require("fs");

const DEFAULT_PORT = Number(process.env.CSR_PORT || 8080);
const ROOT_DIR = path.resolve(__dirname, "..");
const LAUNCHER_DIR = path.resolve(ROOT_DIR, "launcher");
const SERVER_READY_TIMEOUT_MS = 20000;
const SERVER_START_ATTEMPTS = 3;
const PORT_SCAN_ATTEMPTS = 25;
const UPDATER_STATUS_CHANNEL = "desktop-updater:status";
const DEFAULT_UPDATER_NOTES = Object.freeze([
  "Improvements and fixes included in this update.",
]);

let mainWindow = null;
let serverProcess = null;
let isShuttingDown = false;
let startupInProgress = false;
let activePort = DEFAULT_PORT;
let updaterInitialized = false;
let updaterCheckInFlight = false;
let updaterDownloadRequested = false;
let updaterConfig = null;
let updaterState = createUpdaterState({
  status: "disabled",
  message: "Auto-update is available only in installed Windows builds.",
});

const SINGLE_INSTANCE_ERROR_TITLE = "App Already Running";
const SINGLE_INSTANCE_ERROR_MESSAGE =
  "The app is already running. Close the app and open it again.";
const hasSingleInstanceLock = app.requestSingleInstanceLock();

function findFirstExistingPath(candidates) {
  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (_) {
      // Ignore probe errors and continue fallback search.
    }
  }
  return null;
}

function resolveAppIconPath() {
  const iconCandidates = [
    path.resolve(ROOT_DIR, "assets", "logo", "favicon.ico"),
    path.resolve(ROOT_DIR, "assets", "logo", "android-chrome-512x512.png"),
    path.resolve(ROOT_DIR, "assets", "logo", "apple-touch-icon.png"),
  ];
  return findFirstExistingPath(iconCandidates);
}

function resolveServerEntrypoint() {
  return path.join(LAUNCHER_DIR, "server.js");
}

function resolvePreloadEntrypoint() {
  return path.join(LAUNCHER_DIR, "preload.cjs");
}

function resolveUpdaterConfigPath() {
  return path.join(LAUNCHER_DIR, "updater-config.json");
}

function normalizeText(value) {
  return String(value == null ? "" : value).trim();
}

function ensureTrailingSlash(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function normalizeReleaseNotes(noteSource) {
  if (typeof noteSource === "string") {
    return noteSource
      .split(/\r?\n/)
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }
  if (Array.isArray(noteSource)) {
    return noteSource
      .flatMap((entry) => {
        if (typeof entry === "string") {
          return [entry];
        }
        if (entry && typeof entry === "object") {
          const text = normalizeText(
            entry.note || entry.text || entry.message || entry.name
          );
          return text ? [text] : [];
        }
        return [];
      })
      .map((entry) => normalizeText(entry))
      .filter(Boolean);
  }
  return [];
}

function createUpdaterState(overrides = {}) {
  const normalizedNotes = normalizeReleaseNotes(overrides.releaseNotes);
  return {
    status: normalizeText(overrides.status) || "disabled",
    currentVersion: app.getVersion(),
    latestVersion: normalizeText(overrides.latestVersion),
    releaseNotes: normalizedNotes.length ? normalizedNotes : [...DEFAULT_UPDATER_NOTES],
    message: normalizeText(overrides.message),
    progressPercent: Number.isFinite(Number(overrides.progressPercent))
      ? Math.max(0, Math.min(100, Number(overrides.progressPercent)))
      : 0,
    canUpdate: Boolean(overrides.canUpdate),
  };
}

function sanitizeUpdaterState(state) {
  return createUpdaterState(state);
}

function broadcastUpdaterState() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  try {
    mainWindow.webContents.send(
      UPDATER_STATUS_CHANNEL,
      sanitizeUpdaterState(updaterState)
    );
  } catch (_) {
    // Ignore renderer broadcast failures.
  }
}

function setUpdaterState(patch) {
  updaterState = createUpdaterState({
    ...updaterState,
    ...patch,
  });
  broadcastUpdaterState();
  return updaterState;
}

function isUpdaterSupportedBuild() {
  if (process.platform !== "win32") {
    return false;
  }
  if (!app.isPackaged) {
    return false;
  }
  const execPath = normalizeText(process.execPath).toLowerCase();
  if (!execPath) {
    return false;
  }
  return !execPath.includes("portable") && !execPath.includes("win-unpacked");
}

function loadUpdaterConfig() {
  const defaults = {
    enabled: false,
    provider: "generic",
    baseUrl: "",
    channel: "latest",
    notesFile: "release-notes.json",
  };
  try {
    const configPath = resolveUpdaterConfigPath();
    if (!fs.existsSync(configPath)) {
      return defaults;
    }
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      enabled: Boolean(parsed && parsed.enabled),
      provider: normalizeText(parsed && parsed.provider) || defaults.provider,
      baseUrl: ensureTrailingSlash(parsed && parsed.baseUrl),
      channel: normalizeText(parsed && parsed.channel) || defaults.channel,
      notesFile: normalizeText(parsed && parsed.notesFile) || defaults.notesFile,
    };
  } catch (_) {
    return defaults;
  }
}

function extractReleaseNotesFromJson(payload, targetVersion) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const directNotes = normalizeReleaseNotes(payload.notes);
  if (directNotes.length) {
    return directNotes;
  }

  const normalizedTargetVersion = normalizeText(targetVersion);
  if (
    normalizedTargetVersion &&
    normalizeText(payload.version) === normalizedTargetVersion
  ) {
    const versionNotes = normalizeReleaseNotes(payload.notes);
    if (versionNotes.length) {
      return versionNotes;
    }
  }

  const releases =
    payload.releases && typeof payload.releases === "object"
      ? payload.releases
      : null;
  if (releases && normalizedTargetVersion) {
    const matchedRelease = releases[normalizedTargetVersion];
    if (matchedRelease) {
      const matchedNotes = normalizeReleaseNotes(
        matchedRelease.notes || matchedRelease.releaseNotes || matchedRelease.body || matchedRelease
      );
      if (matchedNotes.length) {
        return matchedNotes;
      }
    }
  }

  if (normalizedTargetVersion && payload[normalizedTargetVersion]) {
    const matchedNotes = normalizeReleaseNotes(payload[normalizedTargetVersion]);
    if (matchedNotes.length) {
      return matchedNotes;
    }
  }

  return [];
}

async function fetchHostedReleaseNotes(version) {
  if (
    !updaterConfig ||
    normalizeText(updaterConfig.provider).toLowerCase() !== "generic" ||
    !normalizeText(updaterConfig.baseUrl)
  ) {
    return [];
  }

  const notesFile = normalizeText(updaterConfig.notesFile) || "release-notes.json";
  try {
    const notesUrl = new URL(notesFile, updaterConfig.baseUrl);
    const response = await fetch(notesUrl.toString(), {
      cache: "no-store",
    });
    if (!response || !response.ok) {
      return [];
    }
    const payload = await response.json();
    return extractReleaseNotesFromJson(payload, version);
  } catch (_) {
    return [];
  }
}

async function resolveReleaseNotes(info) {
  const directNotes = normalizeReleaseNotes(info && info.releaseNotes);
  if (directNotes.length) {
    return directNotes;
  }
  const hostedNotes = await fetchHostedReleaseNotes(info && info.version);
  return hostedNotes.length ? hostedNotes : [...DEFAULT_UPDATER_NOTES];
}

function formatUpdaterError(error, fallbackMessage) {
  const rawMessage = normalizeText(
    error && typeof error === "object" ? error.message || error.stack : error
  );
  return rawMessage || fallbackMessage;
}

function resolveDataRootDir() {
  const fromEnv = String(process.env.CSR_DATA_DIR || "").trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.resolve(app.getPath("userData"), "runtime-data");
}

function ensureDataDirs(dataRootDir) {
  const requiredDirs = [
    path.resolve(dataRootDir, "downloads"),
    path.resolve(dataRootDir, "db"),
  ];
  for (const dir of requiredDirs) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {
      // Server will surface write failures when paths are used.
    }
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAppUrl(port) {
  return `http://127.0.0.1:${port}/main/index.html`;
}

function canBindPort(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.unref();
    probe.once("error", () => resolve(false));
    probe.listen({ host: "127.0.0.1", port }, () => {
      probe.close(() => resolve(true));
    });
  });
}

async function resolveAvailablePort(preferredPort) {
  const startPort = Number.isFinite(Number(preferredPort))
    ? Number(preferredPort)
    : 8080;
  for (let offset = 0; offset < PORT_SCAN_ATTEMPTS; offset += 1) {
    const candidate = startPort + offset;
    // eslint-disable-next-line no-await-in-loop
    if (await canBindPort(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `No available localhost port found from ${startPort} to ${
      startPort + PORT_SCAN_ATTEMPTS - 1
    }.`
  );
}

async function waitForServerReady(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        const status = Number(res && res.statusCode);
        res.resume();
        resolve(status >= 200 && status < 500);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(1200, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) {
      return true;
    }
    await wait(250);
  }
  return false;
}

async function startServer() {
  const entry = resolveServerEntrypoint();
  if (!fs.existsSync(entry)) {
    throw new Error(`Server entry not found: ${entry}`);
  }
  const dataRootDir = resolveDataRootDir();
  ensureDataDirs(dataRootDir);
  activePort = await resolveAvailablePort(DEFAULT_PORT);
  const appUrl = buildAppUrl(activePort);

  startupInProgress = true;
  let lastError = null;
  for (let attempt = 1; attempt <= SERVER_START_ATTEMPTS; attempt += 1) {
    serverProcess = fork(entry, [String(activePort)], {
      cwd: ROOT_DIR,
      stdio: "ignore",
      env: {
        ...process.env,
        CSR_DATA_DIR: dataRootDir,
      },
    });
    serverProcess.on("exit", (code, signal) => {
      serverProcess = null;
      if (!isShuttingDown && !startupInProgress) {
        dialog.showErrorBox(
          "CSR Server Stopped",
          `The local CSR server stopped unexpectedly.\n\nEntry: ${entry}\nExit code: ${String(
            code
          )}\nSignal: ${String(signal)}`
        );
        app.quit();
      }
    });

    const ready = await waitForServerReady(appUrl, SERVER_READY_TIMEOUT_MS);
    if (ready) {
      startupInProgress = false;
      return;
    }

    lastError = new Error(
      `Local server did not become ready (attempt ${attempt}/${SERVER_START_ATTEMPTS}).`
    );
    stopServer();

    await wait(300 * attempt);
  }

  startupInProgress = false;
  throw lastError || new Error("Local server did not become ready.");
}

async function createMainWindow() {
  await startServer();
  const appIconPath = resolveAppIconPath();
  const preloadPath = resolvePreloadEntrypoint();
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    icon: appIconPath || undefined,
    webPreferences: {
      preload: fs.existsSync(preloadPath) ? preloadPath : undefined,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.maximize();
      mainWindow.show();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
  enforceFixedZoom(mainWindow);
  await mainWindow.loadURL(buildAppUrl(activePort));
  broadcastUpdaterState();
}

function stopServer() {
  if (!serverProcess) {
    return;
  }
  try {
    serverProcess.kill();
  } catch (_) {
    // Ignore shutdown errors.
  }
  serverProcess = null;
}

function enforceFixedZoom(win) {
  const webContents = win && win.webContents;
  if (!webContents) {
    return;
  }

  const resetZoom = () => {
    try {
      webContents.setZoomFactor(1);
    } catch (_) {
      // Ignore zoom reset failures.
    }
    try {
      webContents.setZoomLevel(0);
    } catch (_) {
      // Ignore zoom reset failures.
    }
  };

  if (typeof webContents.setVisualZoomLevelLimits === "function") {
    webContents.setVisualZoomLevelLimits(1, 1).catch(() => null);
  }
  if (typeof webContents.setLayoutZoomLevelLimits === "function") {
    webContents.setLayoutZoomLevelLimits(0, 0).catch(() => null);
  }

  webContents.on("before-input-event", (event, input) => {
    const key = String((input && input.key) || "").toLowerCase();
    const code = String((input && input.code) || "").toLowerCase();
    const type = String((input && input.type) || "").toLowerCase();
    const isCtrl = !!(input && input.control);
    const isZoomHotkey =
      isCtrl &&
      (key === "+" ||
        key === "=" ||
        key === "-" ||
        key === "_" ||
        key === "0" ||
        code === "numpadadd" ||
        code === "numpadsubtract" ||
        code === "digit0" ||
        code === "numpad0");
    const isCtrlWheel = isCtrl && type === "mousewheel";
    if (isZoomHotkey || isCtrlWheel) {
      event.preventDefault();
      resetZoom();
    }
  });

  webContents.on("zoom-changed", (event) => {
    event.preventDefault();
    resetZoom();
  });
  webContents.on("did-finish-load", resetZoom);
  webContents.on("did-navigate-in-page", resetZoom);

  resetZoom();
}

async function runUpdaterCheck() {
  if (!updaterInitialized || updaterCheckInFlight) {
    return sanitizeUpdaterState(updaterState);
  }
  updaterCheckInFlight = true;
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    setUpdaterState({
      status: "error",
      canUpdate: false,
      progressPercent: 0,
      message: formatUpdaterError(error, "Unable to check for updates right now."),
    });
  } finally {
    updaterCheckInFlight = false;
  }
  return sanitizeUpdaterState(updaterState);
}

function scheduleQuitAndInstall() {
  if (isShuttingDown) {
    return;
  }
  setUpdaterState({
    status: "downloaded",
    canUpdate: false,
    progressPercent: 100,
    message: "Closing app to install update...",
  });
  setTimeout(() => {
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (error) {
      setUpdaterState({
        status: "error",
        canUpdate: false,
        progressPercent: 0,
        message: formatUpdaterError(error, "Unable to start the installer update."),
      });
    }
  }, 700);
}

async function startInstallerUpdate() {
  if (!updaterInitialized) {
    return sanitizeUpdaterState(updaterState);
  }
  if (updaterState.status === "downloaded") {
    scheduleQuitAndInstall();
    return sanitizeUpdaterState(updaterState);
  }
  if (updaterState.status === "downloading" || updaterDownloadRequested) {
    return sanitizeUpdaterState(updaterState);
  }
  if (updaterState.status !== "available") {
    return sanitizeUpdaterState(updaterState);
  }

  updaterDownloadRequested = true;
  setUpdaterState({
    status: "downloading",
    canUpdate: false,
    progressPercent: 0,
    message: "Downloading update...",
  });
  try {
    await autoUpdater.downloadUpdate();
  } catch (error) {
    updaterDownloadRequested = false;
    setUpdaterState({
      status: "error",
      canUpdate: false,
      progressPercent: 0,
      message: formatUpdaterError(error, "Unable to download the update."),
    });
  }
  return sanitizeUpdaterState(updaterState);
}

function registerUpdaterIpcHandlers() {
  ipcMain.handle("desktop-updater:get-state", async () => sanitizeUpdaterState(updaterState));
  ipcMain.handle("desktop-updater:check", async () => runUpdaterCheck());
  ipcMain.handle("desktop-updater:start-install", async () => startInstallerUpdate());
}

function initializeAutoUpdater() {
  if (updaterInitialized) {
    broadcastUpdaterState();
    return;
  }
  if (!isUpdaterSupportedBuild()) {
    setUpdaterState({
      status: "disabled",
      canUpdate: false,
      progressPercent: 0,
      message: "Auto-update is available only in installed Windows builds.",
    });
    return;
  }

  updaterConfig = loadUpdaterConfig();
  const provider = normalizeText(updaterConfig.provider).toLowerCase();
  if (!updaterConfig.enabled || provider !== "generic" || !normalizeText(updaterConfig.baseUrl)) {
    setUpdaterState({
      status: "disabled",
      canUpdate: false,
      progressPercent: 0,
      message: "Auto-update is not configured for this build.",
    });
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.setFeedURL({
    provider: "generic",
    url: updaterConfig.baseUrl,
    channel: updaterConfig.channel,
  });

  autoUpdater.on("checking-for-update", () => {
    setUpdaterState({
      status: "checking",
      canUpdate: false,
      progressPercent: 0,
      message: "Checking for updates...",
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    updaterDownloadRequested = false;
    setUpdaterState({
      status: "idle",
      latestVersion: normalizeText(info && info.version) || app.getVersion(),
      canUpdate: false,
      progressPercent: 0,
      message: "App is up to date.",
    });
  });

  autoUpdater.on("update-available", async (info) => {
    updaterDownloadRequested = false;
    const releaseNotes = await resolveReleaseNotes(info);
    setUpdaterState({
      status: "available",
      latestVersion: normalizeText(info && info.version),
      releaseNotes,
      canUpdate: true,
      progressPercent: 0,
      message: "A new version is available with improvements and fixes.",
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Number.isFinite(Number(progress && progress.percent))
      ? Math.round(Number(progress.percent))
      : 0;
    setUpdaterState({
      status: "downloading",
      canUpdate: false,
      progressPercent: percent,
      message: percent > 0 ? `Downloading update... ${percent}%` : "Downloading update...",
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    updaterDownloadRequested = false;
    const currentNotes = normalizeReleaseNotes(updaterState.releaseNotes);
    const releaseNotes = currentNotes.length ? currentNotes : await resolveReleaseNotes(info);
    setUpdaterState({
      status: "downloaded",
      latestVersion: normalizeText(info && info.version) || updaterState.latestVersion,
      releaseNotes,
      canUpdate: false,
      progressPercent: 100,
      message: "Preparing installer...",
    });
    scheduleQuitAndInstall();
  });

  autoUpdater.on("error", (error) => {
    updaterDownloadRequested = false;
    setUpdaterState({
      status: "error",
      canUpdate: false,
      progressPercent: 0,
      message: formatUpdaterError(error, "Updater encountered an unexpected error."),
    });
  });

  updaterInitialized = true;
  setUpdaterState({
    status: "idle",
    canUpdate: false,
    progressPercent: 0,
    message: "Checking for updates...",
  });
  void runUpdaterCheck();
}

if (!hasSingleInstanceLock) {
  dialog.showErrorBox(SINGLE_INSTANCE_ERROR_TITLE, SINGLE_INSTANCE_ERROR_MESSAGE);
  app.quit();
} else {
  registerUpdaterIpcHandlers();

  app.on("second-instance", () => {
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  });

  app.on("window-all-closed", () => {
    isShuttingDown = true;
    stopServer();
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", () => {
    isShuttingDown = true;
    stopServer();
  });

  app.whenReady().then(() => {
    createMainWindow()
      .then(() => {
        initializeAutoUpdater();
      })
      .catch((error) => {
        dialog.showErrorBox(
          "Startup Failed",
          `CSR desktop startup failed.\n\n${String(
            error && error.message ? error.message : error
          )}`
        );
        app.quit();
      });
  });
}
