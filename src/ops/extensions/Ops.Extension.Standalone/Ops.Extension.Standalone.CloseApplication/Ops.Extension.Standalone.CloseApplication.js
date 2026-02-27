const electron = op.require("electron");

const inQuit = op.inTriggerButton("Quit");

inQuit.onTriggered = () =>
{
    if(!electron || !electron.ipcRenderer) return;
    electron.ipcRenderer.send("closeApplication");
};
