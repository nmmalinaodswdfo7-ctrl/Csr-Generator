const { contextBridge, ipcRenderer } = require("electron");

const UPDATER_STATUS_CHANNEL = "desktop-updater:status";

function createUpdaterBridge() {
  return {
    getState() {
      return ipcRenderer.invoke("desktop-updater:get-state");
    },
    checkForUpdates() {
      return ipcRenderer.invoke("desktop-updater:check");
    },
    startInstallUpdate() {
      return ipcRenderer.invoke("desktop-updater:start-install");
    },
    onStatusChange(callback) {
      if (typeof callback !== "function") {
        return () => {};
      }
      const wrapped = (_event, payload) => {
        callback(payload);
      };
      ipcRenderer.on(UPDATER_STATUS_CHANNEL, wrapped);
      return () => {
        ipcRenderer.removeListener(UPDATER_STATUS_CHANNEL, wrapped);
      };
    },
  };
}

contextBridge.exposeInMainWorld("csrDesktopUpdater", createUpdaterBridge());
