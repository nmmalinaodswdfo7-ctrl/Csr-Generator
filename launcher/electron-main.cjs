const { app, BrowserWindow, dialog, shell } = require("electron");
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

let mainWindow = null;
let serverProcess = null;
let isShuttingDown = false;
let startupInProgress = false;
let activePort = DEFAULT_PORT;

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
  const sourceEntry = path.join(LAUNCHER_DIR, "server.js");
  return sourceEntry;
}

function resolveDataRootDir() {
  const fromEnv = String(process.env.CSR_DATA_DIR || "").trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  // Keep runtime data in Electron's writable userData directory.
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
    `No available localhost port found from ${startPort} to ${startPort + PORT_SCAN_ATTEMPTS - 1}.`
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
          `The local CSR server stopped unexpectedly.\n\nEntry: ${entry}\nExit code: ${String(code)}\nSignal: ${String(signal)}`
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
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    icon: appIconPath || undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      // Open maximized on desktop/laptop in packaged and dev builds.
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

if (!hasSingleInstanceLock) {
  dialog.showErrorBox(SINGLE_INSTANCE_ERROR_TITLE, SINGLE_INSTANCE_ERROR_MESSAGE);
  app.quit();
} else {
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
    createMainWindow().catch((error) => {
      dialog.showErrorBox(
        "Startup Failed",
        `CSR desktop startup failed.\n\n${String(error && error.message ? error.message : error)}`
      );
      app.quit();
    });
  });
}


