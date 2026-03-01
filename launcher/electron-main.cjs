const { app, BrowserWindow, dialog, shell } = require("electron");
const { fork } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = process.env.CSR_PORT || "8080";
const ROOT_DIR = path.resolve(__dirname, "..");
const LAUNCHER_DIR = path.resolve(ROOT_DIR, "launcher");
const APP_URL = `http://127.0.0.1:${PORT}/main/index.html`;
const SERVER_READY_TIMEOUT_MS = 20000;
const SERVER_EXISTING_CHECK_TIMEOUT_MS = 1500;
const SERVER_START_ATTEMPTS = 3;

let mainWindow = null;
let serverProcess = null;
let isShuttingDown = false;
let startupInProgress = false;

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
    path.resolve(dataRootDir, "backup"),
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

  // Reuse an already-running local server on the same port when available.
  const existingReady = await waitForServerReady(
    APP_URL,
    SERVER_EXISTING_CHECK_TIMEOUT_MS
  );
  if (existingReady) {
    return;
  }

  startupInProgress = true;
  let lastError = null;
  for (let attempt = 1; attempt <= SERVER_START_ATTEMPTS; attempt += 1) {
    serverProcess = fork(entry, [String(PORT)], {
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

    const ready = await waitForServerReady(APP_URL, SERVER_READY_TIMEOUT_MS);
    if (ready) {
      startupInProgress = false;
      return;
    }

    lastError = new Error(
      `Local server did not become ready (attempt ${attempt}/${SERVER_START_ATTEMPTS}).`
    );
    stopServer();

    // If another process took the port and is healthy now, continue with it.
    const fallbackReady = await waitForServerReady(
      APP_URL,
      SERVER_EXISTING_CHECK_TIMEOUT_MS
    );
    if (fallbackReady) {
      startupInProgress = false;
      return;
    }

    await wait(300 * attempt);
  }

  startupInProgress = false;
  throw lastError || new Error("Local server did not become ready.");
}

async function createMainWindow() {
  await startServer();
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
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
  await mainWindow.loadURL(APP_URL);
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

