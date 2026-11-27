const McpServer = op.require("@modelcontextprotocol/sdk/server/mcp.js");
const StreamableHTTPServerTransport = op.require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const http = op.require("node:http");
const https = op.require("node:https");
const { z } = op.require("zod") || window.zod;

// the web editor has no node, there the tools are only registered and no server is started
const isStandalone = !!http;
const ResourceTemplate = isStandalone ? McpServer.ResourceTemplate : McpResourceTemplate;

const
    inRestart = op.inTriggerButton("Restart Server"),
    inStop = op.inTriggerButton("Stop Server"),
    inShowLog = op.inTriggerButton("Show Log"),
    inRequest = op.inObject("Request"),
    inHandleRequest = op.inTrigger("Handle Request"),
    outStarted = op.outBoolNum("Started", false),
    outData = op.outObject("Last Request Data"),
    outLog = op.outString("Log", ""),
    outStats = op.outObject("Stats"),
    outResponse = op.outObject("Response"),
    outResponseReady = op.outTrigger("Response Ready");

const MCP_PORT = 3000;
const SCREENSHOT_DEFAULT_MAX_SIZE = 640;
const PATCHFIELD_SCREENSHOT_MAX_SIZE = 480;
const ELEMENT_HTML_MAX_LENGTH = 2000;
const OP_DOC_POLL_MS = 100;

const SERVER_INSTRUCTIONS = [
    "cables is a node based visual programming editor. a patch is a graph of ops (nodes) connected by links between their ports.",
    "",
    "terms:",
    "- op name (objName): the full name of an op type, e.g. Ops.Gl.Texture_v3. find names with search-ops, read their ports with get-op-summary-doc.",
    "- op id: the id of one op instance in the current patch, e.g. \"a1b2c3d4e\". add-op returns it, get-patch-overview lists all of them. every opId parameter needs this id, never the op name.",
    "- port: an input or output of an op, addressed by its exact name (case sensitive, spaces included) as listed by add-op or get-op-summary-doc.",
    "- links always go from an output port to an input port of the same type. trigger ports (Exec, Render, Next...) run things: a chain of trigger links starting at Ops.Gl.MainLoop_v2 runs every frame.",
    "",
    "workflow to build or change something in the patch:",
    "1. get-patch-overview to see what is already there.",
    "2. search-ops to find ops, get-op-summary-doc for their ports (or load-example-patch to see an op in use).",
    "3. batch-add-ops to add several ops with their values and links in one call (arranged automatically). for single changes add-op without x/y, link-ports, set-port-value, then tidy-up-ops once with the ids of all ops you added.",
    "4. batch-set-port-values and batch-link-ports to change many values or links of existing ops in one call.",
    "5. check the result: get-patch-errors, screenshot for the webgl canvas, inspect-element-port for html elements and 2d canvases.",
    "6. save-patch.",
    "",
    "op code: read-op to read, edit-op-text to change (small exact replacements). new ops: create-op (only Ops.Local.*), then rename-op to move them to another namespace, clone-op for copies and new versions (_v2). always use these tools, never write op files on disk.",
    "",
    "cables patches flow from top to bottom: an op belongs below the ops linked to its inputs. place ops with tidy-up-ops, not with x/y or move-op.",
    "when a tool fails, its error text says why: fix the parameter and try again instead of guessing another tool."
].join("\n");

// zod schemas with descriptions for parameters that many tools share, the description is what the client model reads
const param = {
    "opId": () => { return z.string().describe("id of an op in the current patch (from add-op or get-patch-overview), e.g. \"a1b2c3d4e\", not the op name"); },
    "opName": () => { return z.string().describe("full op name, e.g. Ops.Gl.Texture_v3 (from search-ops)"); },
    "portName": () => { return z.string().describe("exact port name, case sensitive (as listed by add-op or get-op-summary-doc), e.g. \"Exec\""); },
    "maxSize": () => { return z.number().optional().describe("longest edge of the returned image in pixels, default " + SCREENSHOT_DEFAULT_MAX_SIZE + ", 0 = original size; bigger images cost more tokens"); },
    "filter": () => { return z.string().optional().describe("only list entries whose name contains this text"); },
    "stackKey": () => { return z.string().optional().describe("stacked ops only: loop key of a hidden copy, e.g. \"3\" or \"1/3\", leave out for the visible op"); },
    "limit": (defaultValue) => { return z.number().optional().describe("maximum number of entries, default " + defaultValue); }
};
const SELF_EXECUTE_DELAY_MS = 100;
const SEARCH_DEFAULT_LIMIT = 20;
const PATCHFIELD_VIEW_ANIM_MS = 500;
const KEYFRAME_TIME_TOLERANCE = 0.0005;
const LISTEN_RETRY_MS = 20;
const LISTEN_MAX_RETRIES = 1150;
const RELOAD_EDITOR_DELAY_MS = 300;
const COLLECTION_LOAD_TIMEOUT_MS = 30000;

const CONSOLE_DEFAULT_LIMIT = 100;
const CONSOLE_LEVELS = ["verbose", "info", "warning", "error"];

const consoleEntries = [];
let devToolsSocket = null;

let currentServer = null;
buildMcpServer();

function urlName(name)
{
    return name.replace(/ /g, "_");
}

function findOpenTab(urlSafeName)
{
    for (let i = 0; i < gui.mainTabs.tabs.length; i++)
    {
        const tab = gui.mainTabs.tabs[i];
        if (tab.editor && urlName(tab.editor.options.name) === urlSafeName) return tab;
    }
    return null;
}

function listOpenTabResources()
{
    const resources = [];
    for (let i = 0; i < gui.mainTabs.tabs.length; i++)
    {
        const tab = gui.mainTabs.tabs[i];
        if (tab.editor)
            resources.push(
            {
                "uri": "mcpfile:///" + urlName(tab.editor.options.name),
                "name": tab.editor.options.name,
                "title": tab.editor.options.title,
                "mimeType": "text/plain"
            });
    }
    return resources;
}

// sends a talkerAPI command and resolves with its result
function talkerSend(cmd, data)
{
    return new Promise((resolve, reject) =>
    {
        CABLESUILOADER.talkerAPI.send(cmd, data, (err, rslt) =>
        {
            if (err) reject(new Error(err.msg || JSON.stringify(err)));
            else resolve(rslt);
        });
    });
}

// downloads a url in the editor and resolves with its content as a data url
async function urlToDataUrl(url)
{
    const response = await fetch(url);
    if (!response.ok) throw new Error("download failed: " + response.status + " " + response.statusText);

    const blob = await response.blob();
    return new Promise((resolve, reject) =>
    {
        const reader = new FileReader();
        reader.onload = () => { resolve(reader.result); };
        reader.onerror = () => { reject(reader.error); };
        reader.readAsDataURL(blob);
    });
}

// rejects when a promise does not settle in time, so tools report which step hung instead of blocking
function withTimeout(promise, ms, step)
{
    return Promise.race([promise, new Promise((resolve, reject) => { setTimeout(() => { reject(new Error("timeout in step: " + step)); }, ms); })]);
}

outLog.changeAlways = true;

window.cablesMcpCallCount = window.cablesMcpCallCount || 0;

// call counts per tool/resource name, kept on window so they survive op reloads like the call counter
window.cablesMcpStats = window.cablesMcpStats || { "started": Date.now(), "tools": {} };
outStats.setRef(window.cablesMcpStats);

function countCall(name)
{
    const stats = window.cablesMcpStats;
    stats.tools[name] = (stats.tools[name] || 0) + 1;
    stats.calls = (stats.calls || 0) + 1;
    stats.lastTool = name;
    stats.lastCall = Date.now();
    outStats.setRef(stats);
}

// every tool call creates a heavy event, so it is visible (e.g. in the Performance op) that something is happening
function emitHeavyEvent(toolName)
{
    try
    {
        const cgl = op.patch.cgl;
        if (cgl && cgl.profileData) cgl.profileData.addHeavyEvent("mcp tool", toolName);
    }
    catch (e) {}
}

// set once per editor window: an op reload keeps it, a full editor reload starts a new one
window.cablesMcpEditorStarted = window.cablesMcpEditorStarted || Date.now();
const EDITOR_STARTED_KEY = "cablesMcpEditorStarted";

// the first tool call after a full editor reload gets a note, so the client knows unsaved changes are gone
function reloadNote()
{
    const started = String(window.cablesMcpEditorStarted);
    let last = null;
    try
    {
        last = localStorage.getItem(EDITOR_STARTED_KEY);
        localStorage.setItem(EDITOR_STARTED_KEY, started);
    }
    catch (e) { return null; }
    if (!last || last == started) return null;
    return "note: the editor was reloaded since the last tool call. changes that were not saved before are gone, check the patch again (get-patch-overview).";
}

// wraps a register function so every call of the registered handler (always the last argument) is counted under its name
function countedRegister(server, registerName)
{
    const register = server[registerName].bind(server);
    server[registerName] = (name, ...args) =>
    {
        const handler = args.pop();
        return register(name, ...args, async (...handlerArgs) =>
        {
            countCall(name);
            if (registerName != "tool") return handler(...handlerArgs);

            emitHeavyEvent(name);
            const note = reloadNote();
            const result = await handler(...handlerArgs);
            if (note && result && Array.isArray(result.content)) result.content.unshift({ "type": "text", "text": note });
            return result;
        });
    };
}

const LOG_MAX_LINES = 2000;
const LOG_SCROLL_SLACK = 20;
const LOG_TAB_TITLE = "MCP Log";

// the log, its tab and the server controls live on window, so they keep working after an op reload and for a deleted op that still runs the server
window.cablesMcpLog = window.cablesMcpLog || [];

function logStatus(_log)
{
    outLog.set(_log);
    const entry = { "time": Date.now(), "text": String(_log) };
    window.cablesMcpLog.push(entry);
    if (window.cablesMcpLog.length > LOG_MAX_LINES) window.cablesMcpLog.shift();
    if (window.cablesMcpLogTab) appendLogLine(window.cablesMcpLogTab, entry);
}

function logLineElement(entry)
{
    const line = document.createElement("div");
    line.innerText = new Date(entry.time).toLocaleTimeString() + "  " + entry.text;
    return line;
}

// keeps following new lines only while the log is scrolled to the bottom
function appendLogLine(tab, entry)
{
    const logEle = tab.mcpLogEle;
    if (!logEle) return;
    const atBottom = logEle.scrollTop + logEle.clientHeight >= logEle.scrollHeight - LOG_SCROLL_SLACK;
    logEle.appendChild(logLineElement(entry));
    if (logEle.childElementCount > LOG_MAX_LINES) logEle.firstElementChild.remove();
    if (atBottom) logEle.scrollTop = logEle.scrollHeight;
}

function showLogTab()
{
    gui.maintabPanel.show(true);
    if (window.cablesMcpLogTab && gui.mainTabs.getTabByTitle(LOG_TAB_TITLE))
    {
        gui.mainTabs.activateTab(window.cablesMcpLogTab.id);
        return;
    }

    const tab = new CABLES.UI.Tab(LOG_TAB_TITLE, { "icon": "logs", "singleton": true, "padding": true });
    gui.mainTabs.addTab(tab, true);
    tab.addButton("Restart Server", () => { if (window.cablesMcpControl) window.cablesMcpControl.restart(); });
    tab.addButton("Stop Server", () => { if (window.cablesMcpControl) window.cablesMcpControl.stop(); });
    tab.addButton("Clear", () =>
    {
        window.cablesMcpLog.length = 0;
        tab.mcpLogEle.innerHTML = "";
    });

    tab.html("<div style=\"height:100%;overflow:auto;font-family:monospace;white-space:pre-wrap;user-select:text;\"></div>");
    tab.mcpLogEle = tab.contentEle.firstElementChild;
    for (let i = 0; i < window.cablesMcpLog.length; i++) tab.mcpLogEle.appendChild(logLineElement(window.cablesMcpLog[i]));
    tab.mcpLogEle.scrollTop = tab.mcpLogEle.scrollHeight;

    tab.on(CABLES.UI.Tab.EVENT_CLOSE, () => { window.cablesMcpLogTab = null; });
    window.cablesMcpLogTab = tab;
}

const MENUBAR_ITEM_ID = "nav-item-mcp";

// the op adds its own status icon to the editor's menubar, a click opens the log tab of the current instance
function menubarItem()
{
    // an item made by older op code (without the call count) is replaced
    let item = document.getElementById(MENUBAR_ITEM_ID);
    if (item && item.querySelector(".mcp-calls")) return item;
    if (item) item.remove();

    const list = document.querySelector("#menubar nav > ul");
    if (!list) return null;

    item = document.createElement("li");
    item.id = MENUBAR_ITEM_ID;
    item.classList.add("hidden");
    item.innerHTML = "<span class=\"icon-bot icon tt\" style=\"display:inherit;margin:-3px;\" data-tt=\"MCP server is running, highlighted while a client is connected, the number counts tool calls, click to show the log\"></span><span class=\"mcp-calls\" style=\"margin-left:6px;\"></span>";
    item.addEventListener("click", () => { if (window.cablesMcpShowLog) window.cablesMcpShowLog(); });
    list.appendChild(item);
    updateMenubarCalls();
    return item;
}

function showMenubarIcon(running)
{
    const item = menubarItem();
    if (item) item.classList.toggle("hidden", !running);
}

// the number of tool calls stays visible while a client is connected, so after looking away it shows whether something happened
function updateMenubarCalls()
{
    const item = document.getElementById(MENUBAR_ITEM_ID);
    if (item) item.querySelector(".mcp-calls").innerText = window.cablesMcpCallCount && window.cablesMcpStreams > 0 ? window.cablesMcpCallCount + "x" : "";
}

// a connected client keeps a GET stream open, the icon is highlighted while there is one
window.cablesMcpStreams = window.cablesMcpStreams || 0;

function updateMenubarConnected()
{
    const item = menubarItem();
    if (item) item.querySelector(".icon-bot").classList.toggle("icon-highlight", window.cablesMcpStreams > 0);
    updateMenubarCalls();
}

// every tool call logs through here, the title counts them so it shows the server is still being reached
function logMcp(_log)
{
    window.cablesMcpCallCount++;
    logStatus(_log);
    op.setUiAttrib({ "extendTitle": "called " + window.cablesMcpCallCount + "x" });
    updateMenubarCalls();
    showMenubarCallsActivity();
}

const CALLS_FADE_DELAY = 20000;

// the call number is shown on activity and fades out after a while without tool calls
function showMenubarCallsActivity()
{
    const item = document.getElementById(MENUBAR_ITEM_ID);
    if (!item) return;
    const ele = item.querySelector(".mcp-calls");
    ele.style.transition = "opacity 1s";
    ele.style.opacity = 1;

    clearTimeout(window.cablesMcpCallsFadeTimeout);
    window.cablesMcpCallsFadeTimeout = setTimeout(() => { ele.style.opacity = 0; }, CALLS_FADE_DELAY);
}

// the log port starts with this line instead of "", relinking after an op reload copies the current value to the logger
logStatus("mcp server starting");

// extension and team ops are not known to the editor until their collection is loaded, like "Load" in the op search
function isCollectionOpName(objName)
{
    return objName.startsWith("Ops.Extension.") || objName.startsWith("Ops.Team.");
}

function loadCollection(objName)
{
    return new Promise((resolve) =>
    {
        gui.serverOps.loadCollectionOps(objName, () =>
        {
            s.buildList();
            resolve();
        });
    });
}

// readable name of an op for the log, e.g. "Rectangle" instead of its id
function opLabel(opId)
{
    const o = CABLES.patch.getOpById(opId);
    return o ? o.getTitle() : "unknown op " + opId;
}

// every tool/resource result goes through here, so the op's "Last Request Data" output shows it
function respond(data)
{
    outData.setRef({ "data": data });
    return data;
}

// palette commands plus the dynamic ones that open tabs add, i.e. the op tests commands
function getAllCommands()
{
    const dynamic = gui.cmdPalette && gui.cmdPalette.dynamicCmds ? gui.cmdPalette.dynamicCmds : [];
    return CABLES.CMD.commands.concat(dynamic);
}

function respondText(text)
{
    return respond({ "content": [{ "type": "text", "text": text }] });
}

function respondError(text)
{
    return respond({ "content": [{ "type": "text", "text": text }], "isError": true });
}

function uriLabel(uri)
{
    return String(uri).replace("mcpfile:///", "").replace("cables://opdoc/", "").replace("cables://op/", "");
}

// sets a port value the same way the param panel does: undoable, synced and marked unsaved
function setPortValueUndoable(opId, portName, value)
{
    const apply = (v) =>
    {
        const o = CABLES.patch.getOpById(opId);
        if (!o) return;
        const p = o.getPort(portName);
        if (!p) return;
        p.set(v);
        p.emitEvent("onValueChangeUi");
        gui.emitEvent("portValueEdited", o, p, v);
        gui.savedState.setUnSaved("mcpSetPortValue", o.getSubPatch());
        if (gui.patchView.isCurrentOp(o)) o.refreshParams();
    };

    const oldValue = CABLES.patch.getOpById(opId).getPort(portName).get();
    apply(value);

    if (oldValue !== value)
        CABLES.UI.undo.add(
        {
            "title": "Value change " + portName,
            "context": { "portname": portName },
            "undo": () => { apply(oldValue); },
            "redo": () => { apply(value); }
        });
}

// sets an op comment the same way the param panel's comment field does: an empty comment removes it, undoable and marked unsaved
function setOpCommentUndoable(opId, comment)
{
    const apply = (c) =>
    {
        const o = CABLES.patch.getOpById(opId);
        if (!o) return;
        o.uiAttr({ "comment": c || null });
        o.patch.emitEvent("commentChanged");
        gui.savedState.setUnSaved("mcpSetOpComment", o.getSubPatch());
        if (gui.patchView.isCurrentOp(o)) o.refreshParams();
    };

    const oldComment = CABLES.patch.getOpById(opId).uiAttribs.comment || "";
    apply(comment);

    if (oldComment !== comment)
        CABLES.UI.undo.add(
        {
            "title": "Op comment",
            "undo": () => { apply(oldComment); },
            "redo": () => { apply(comment); }
        });
}

// adds an op via the patch view (loads op dependencies, current subpatch), which registers undo/redo
function addOpUndoable(objName, uiAttribs)
{
    return new Promise((resolve, reject) =>
    {
        const timeout = setTimeout(() => { reject(new Error("timed out, no such op?")); }, 10000);

        gui.patchView.addOp(objName,
        {
            "uiAttribs": uiAttribs,
            "onOpAdd": (newOp) =>
            {
                clearTimeout(timeout);
                resolve(newOp);
            }
        });
    });
}

// sets an input port value after checking op, port and type, returns a short report, throws with the reason otherwise
function setPortValueChecked(opId, portName, value)
{
    const targetOp = CABLES.patch.getOpById(opId);
    if (!targetOp) throw new Error("no op found with id " + opId);

    const port = targetOp.getPort(portName);
    if (!port) throw new Error("no port named \"" + portName + "\" on op " + opId);
    if (port.getType() == CABLES.Port.TYPE_ARRAY || port.getType() == CABLES.Port.TYPE_OBJECT)
        throw new Error("port \"" + portName + "\" is an " + port.getTypeString().toLowerCase() + " port, its value can not be set directly: link an op that creates the data, e.g. Ops.Array.StringToArray_v3 (Type Numbers) for a list of numbers");

    if (port.getType() == CABLES.Port.TYPE_STRING && value !== null && typeof value == "object") value = JSON.stringify(value);
    if (port.getType() == CABLES.Port.TYPE_STRING && (typeof value == "number" || typeof value == "boolean")) value = String(value);

    // setters create a new variable / named trigger when given a new name
    const createsName = (port.uiAttribs._variableSelect && !port.uiAttribs._variableSelectGet) || (port.uiAttribs._triggerSelect && targetOp.objName.indexOf("Ops.Trigger.TriggerSend") == 0);
    const options = port.uiAttribs.values;
    if (!createsName && Array.isArray(options) && (port.uiAttribs.display == "dropdown" || port.uiAttribs.display == "switch"))
    {
        let known = false;
        for (let i = 0; i < options.length; i++)
            if (String(options[i]) == String(value)) known = true;
        if (!known) throw new Error("\"" + value + "\" is not an option of port \"" + portName + "\", options: " + options.join(", "));
    }

    setPortValueUndoable(opId, portName, value);
    return "set " + opId + "." + portName + " = " + JSON.stringify(value);
}

// loads and adds an op, at x/y or, without them, near the view center to be placed later by link-ports. returns the new op, throws with the reason otherwise
async function addOpChecked(objName, x, y)
{
    if (!gui.opDocs.getOpDocByName(objName) && isCollectionOpName(objName))
    {
        try
        {
            await withTimeout(loadCollection(objName), COLLECTION_LOAD_TIMEOUT_MS, "loading the ops of " + objName);
        }
        catch (e)
        {
            throw new Error("could not load the collection of \"" + objName + "\": " + e.message);
        }
    }
    if (!await loadOpDoc(objName)) throw new Error("no op named \"" + objName + "\", find the name with search-ops");

    const placeLater = x === undefined && y === undefined;
    const uiAttribs = {};
    if (placeLater) uiAttribs.translate = patchViewCenter();
    else uiAttribs.translate = { "x": x || 0, "y": y || 0 };

    let newOp;
    try
    {
        newOp = await addOpUndoable(objName, uiAttribs);
    }
    catch (e)
    {
        throw new Error("could not add op \"" + objName + "\": " + e.message);
    }
    if (!newOp) throw new Error("could not add op \"" + objName + "\" (no such op? see search-ops)");

    if (placeLater && gui.patchView.patchRenderer.getGlOp(newOp))
    {
        const rect = opRect(newOp);
        moveToNearestFreeSpot(rect, otherOpRects(newOp, false), true, true);
        newOp.setUiAttribs({ "translate": { "x": rect.x, "y": rect.y } });
        unplacedOpIds.add(newOp.id);
    }

    const opDoc = gui.opDocs.getOpDocByName(objName);
    if (opDoc && !opDoc.layout) gui.serverOps.saveOpLayout(newOp);

    return newOp;
}

// links an output port to an input port like dragging a cable: a value input keeps only the new link. places an unplaced op of the link.
// returns a short report, throws with the reason otherwise
function linkPortsChecked(opId1, portName1, opId2, portName2)
{
    const op1 = CABLES.patch.getOpById(opId1);
    if (!op1) throw new Error("no op found with id " + opId1);

    const op2 = CABLES.patch.getOpById(opId2);
    if (!op2) throw new Error("no op found with id " + opId2);

    if (!op1.getPort(portName1)) throw new Error("no port named \"" + portName1 + "\" on op " + opId1);
    if (!op2.getPort(portName2)) throw new Error("no port named \"" + portName2 + "\" on op " + opId2);

    const undoGroup = CABLES.UI.undo.startGroup();

    const portIn = op2.getPort(portName2);
    const oldLinks = [];
    if (portIn.getType() !== CABLES.Port.TYPE_TRIGGER)
    {
        for (let i = 0; i < portIn.links.length; i++) oldLinks.push(portIn.links[i].portOut);
        portIn.removeLinks();
    }

    const link = CABLES.patch.link(op1, portName1, op2, portName2);

    if (!link)
    {
        for (let i = 0; i < oldLinks.length; i++) CABLES.patch.link(oldLinks[i].op, oldLinks[i].name, op2, portName2);
        CABLES.UI.undo.endGroup(undoGroup, "Link ports");
        throw new Error("could not link " + opId1 + "." + portName1 + " -> " + opId2 + "." + portName2 + " (incompatible ports?)");
    }

    const placedOp = placeLinkedOp(link);
    CABLES.UI.undo.endGroup(undoGroup, "Link ports");

    let text = "linked " + opId1 + "." + portName1 + " -> " + opId2 + "." + portName2;
    if (oldLinks.length) text += "; replaced the link from " + oldLinks.map((p) => p.op.id + "." + p.name).join(", ");
    if (placedOp) text += "; placed " + placedOp.id + " at " + placedOp.uiAttribs.translate.x + "," + placedOp.uiAttribs.translate.y;

    const cycle = cycleThrough(op2, new Set(CABLES.patch.ops));
    if (cycle) text += "; warning: this link closes a cycle " + cycle.map((o) => o.id).join(" -> ") + ", tidy-up-ops can not lay these ops out";
    return text;
}

// the center of the patch editor view in patch coordinates, snapped to the grid
function patchViewCenter()
{
    const viewBox = gui.patchView.patchRenderer.viewBox;
    const center = viewBox.screenToPatchCoord(viewBox.width / 2, viewBox.height / 2);
    return { "x": snapNearest(center[0], CLEANUP_GRID_X), "y": snapNearest(center[1], CLEANUP_GRID_Y) };
}

// resolves after the next frame has been rendered completely, e.g. so a shader recompile
// triggered by an op reload has happened; falls back after a timeout if no frame is rendered (e.g. patch is paused)
function waitForRenderedFrame()
{
    return new Promise((resolve) =>
    {
        const cgl = CABLES.patch.cgl;
        let done = false;
        let listener = null;

        const finish = () =>
        {
            if (done) return;
            done = true;
            clearTimeout(timeout);
            if (listener) setTimeout(() => { cgl.off(listener); }, 0);
            resolve();
        };

        const timeout = setTimeout(finish, 1000);

        // next frame once callbacks run at the start of a frame, before rendering, so wait for the end of that frame
        cgl.addNextFrameOnceCallback(() =>
        {
            if (!done) listener = cgl.on("endFrame", finish);
        });
    });
}

// saves the current patch to disk/server, the same way the editor's own save
// (ctrl+s / save button) does. force=true skips the guest/unsaved-changes
// warning dialogs, since there is no user around to click through them.
// the editor passes the error of a failed save to the callback, e.g. CANCELLED when electron's save-as dialog
// for a patch without a file was closed
function savePatch()
{
    return new Promise((resolve, reject) =>
    {
        gui.patchView.store.saveCurrentProject((err) =>
        {
            if (!err) return resolve();
            let msg = err.msg || err;
            if (msg == "CANCELLED") msg += " (the patch has no file yet and the save-as dialog was closed)";
            reject(new Error(msg));
        }, true);
    });
}

// renames the patch like the editor's patch title dialog (store.setPatchName), but returns errors instead of showing a modal
async function setPatchName(name)
{
    const res = await talkerSend("setProjectName", { "id": gui.project()._id, "name": name });
    const newName = res && res.data && res.data.name;
    if (!newName) throw new Error("server returned no name");

    gui.setProjectName(newName);
    gui.patchParamPanel.show(true);
    return newName;
}

const s = new CABLES.UI.OpSearch();
s.buildList();

gui.mainTabs.on("onTabRemoved", () => { if (currentServer && currentServer.isConnected()) currentServer.sendResourceListChanged(); });
gui.mainTabs.on("onTabAdded", () => { if (currentServer && currentServer.isConnected()) currentServer.sendResourceListChanged(); });

// registryOnly: the tools for the Request/Response ports, next to the http server of the standalone
function buildMcpServer(registryOnly = false)
{
    const server = isStandalone && !registryOnly ? new McpServer.McpServer({ "name": "cables standalone mcp server", "version": "1.0.0" }, { "instructions": SERVER_INSTRUCTIONS }) : new McpToolRegistry();
    if (!registryOnly) currentServer = server;
    countedRegister(server, "tool");
    countedRegister(server, "registerResource");

    // real MCP resources, for clients that browse/read via resources/list + resources/read
    server.registerResource(
        "open-tab",
        new ResourceTemplate("mcpfile:///{name}", { "list": () => ({ "resources": listOpenTabResources() }) }), { "description": "a file currently opened in the cables code editor" },
        async (uri) =>
        {
            logMcp("read file " + uriLabel(uri.href));
            const content = await readResourceContent(uri.href);
            return respond({ "contents": [{ "uri": uri.href, ...content }] });
        }
    );

    server.registerResource(
        "patch json",
        new ResourceTemplate("cables://patch.json", { "list": undefined }), { "description": "read-only structure and data of the current patch" },
        async (uri) =>
        {
            logMcp("read patch.json");
            const content = op.patch.serialize();
            return respond({ "contents": [{ "uri": uri.href, ...content }] });
        }
    );

    server.registerResource(
        "op-source",
        new ResourceTemplate("cables://op/{opname}", { "list": undefined }), { "description": "read-only source code of a cables op; get op names from search-ops" },
        async (uri) =>
        {
            logMcp("read op source " + uriLabel(uri.href));
            const content = await readResourceContent(uri.href);
            return respond({ "contents": [{ "uri": uri.href, ...content }] });
        }
    );

    server.registerResource(
        "op-docs",
        new ResourceTemplate("cables://opdoc/{objName}", { "list": undefined }), { "description": "documentation of a cables op as json (summary, description, port docs, ports layout); get op names from search-ops or list-op-docs" },
        async (uri) =>
        {
            logMcp("read op docs " + uriLabel(uri.href));
            const content = await readResourceContent(uri.href);
            return respond({ "contents": [{ "uri": uri.href, ...content }] });
        }
    );

    // thin tool wrappers around the same resources, so agentic tool-only MCP clients
    // (e.g. Claude Code, which does not always auto-expose resources/list+read as tools)
    // can still browse and read them without relying on client-side resource support
    server.tool(
        "list-resources",
        "list the files that are currently open in the cables code editor tabs, as mcpfile:///<name> uris for read-resource. to read op code prefer read-op, it does not need an open tab.", {},
        () =>
        {
            logMcp("list open files");
            return respond({ "content": listOpenTabResources().map((r) => ({ "type": "resource_link", ...r })) });
        }
    );

    server.tool(
        "read-resource",
        "read a resource by uri: mcpfile:///<name> (an open editor tab, see list-resources), cables://op/<opname> (op code), cables://opdoc/<opname> (op docs) or cables://patch.json (the whole patch, large: prefer get-patch-overview and get-patch-op).", { "uri": z.string().describe("e.g. cables://op/Ops.Gl.Texture_v3 or cables://patch.json") },
        async ({ uri }) =>
        {
            logMcp("read " + uriLabel(uri));
            const content = await readResourceContent(uri);
            return respondText(content.text);
        }
    );

    server.tool(
        "search-ops",
        "search through all available ops, best matches first, one per line as \"name: summary\". limit is the number of results (default " + SEARCH_DEFAULT_LIMIT + ", 0 = all). this is the way to find the op name for add-op. use get-op-summary-doc for ports and docs, read-op for the source.", { "str": z.string().describe("search words, e.g. \"texture\" or \"noise\""), "limit": z.number().optional().describe("maximum number of results, default " + SEARCH_DEFAULT_LIMIT + ", 0 = all") },
        ({ str, limit }) =>
        {
            logMcp("search ops \"" + str + "\"");

            // the search only matches lowercase terms
            s.search(str.toLowerCase());
            const found = s.list.filter((o) => o.score > 0).sort((a, b) => b.score - a.score);
            const maxResults = limit ?? SEARCH_DEFAULT_LIMIT;
            const lines = (maxResults ? found.slice(0, maxResults) : found).map((o) => o.name + ": " + (o.summary || ""));

            if (!lines.length) return respondText("no ops found");
            return respondText(lines.join("\n") + (lines.length < found.length ? "\n(" + lines.length + " of " + found.length + " results)" : ""));
        }
    );

    server.tool(
        "upload-file",
        "upload a file into the patch's asset folder, either downloaded by the editor from a url (the server must allow cors) or from base64 content. returns the path to use in file ports, e.g. the File port of Ops.Gl.Texture_v3. give either url or base64.", { "filename": z.string().describe("file name to store it as, e.g. photo.jpg"), "url": z.string().optional().describe("url to download the file from"), "base64": z.string().optional().describe("file content as base64, without data: prefix") },
        async ({ filename, url, base64 }) =>
        {
            logMcp("upload file " + filename);

            if (!url && !base64) return respondError("pass either url or base64");

            try
            {
                let fileStr = "data:application/octet-stream;base64," + base64;
                if (url) fileStr = await urlToDataUrl(url);

                const result = await talkerSend("fileUploadStr", { "fileStr": fileStr, "filename": filename });
                const savedName = (result && result.filename) || filename;

                return respondText("uploaded " + savedName + ", use it in file ports as ./" + savedName);
            }
            catch (e)
            {
                return respondError("could not upload file: " + e.message);
            }
        }
    );

    server.tool(
        "set-port-value",
        "set the value of an input port of an op in the current patch. numbers for number ports, true/false or 1/0 for booleans, the option text for dropdowns and switches (e.g. \"Center\"). array and object ports can not be set, link an op that creates the data instead (e.g. Ops.Array.StringToArray_v3 for a list of numbers). linked ports get their value from the link, unlink them first.", { "opId": param.opId(), "portName": param.portName(), "value": z.any().describe("the new value, its type has to match the port") },
        ({ opId, portName, value }) =>
        {
            logMcp("set " + opLabel(opId) + "." + portName + " = " + String(JSON.stringify(value)).substring(0, 60));

            try
            {
                return respondText(setPortValueChecked(opId, portName, value));
            }
            catch (e)
            {
                return respondError(e.message);
            }
        }
    );

    server.tool(
        "trigger-port",
        "fire a trigger input port of an op once, like a button press (e.g. \"Reset\" or \"Exec\"), without anything linked to it. fails if the port is not a trigger port.", { "opId": param.opId(), "portName": param.portName() },
        ({ opId, portName }) =>
        {
            logMcp("trigger " + opLabel(opId) + "." + portName);

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);

            const port = targetOp.getPort(portName);
            if (!port) return respondError("no port named \"" + portName + "\" on op " + opId);

            if (port.getType() !== CABLES.Port.TYPE_TRIGGER) return respondError("port \"" + portName + "\" on op " + opId + " is not a trigger port");

            // .trigger() only forwards along the port's own links, which is a no-op for a
            // port that has nothing wired to it. _onTriggered() is what the cables editor's
            // own UI calls when clicking a trigger button (params_listener.js) - it fires the
            // op's onTriggered handler directly, regardless of whether anything is linked.
            port._onTriggered();

            return respondText("triggered " + opId + "." + portName);
        }
    );

    server.tool(
        "link-ports",
        "connect an output port of one op (opId1/portName1) to an input port of another op (opId2/portName2). both ports need the same type (number, trigger, object...). an op added by add-op without x/y is placed here: below the op linked to its input, or above the op it feeds. an output can feed many inputs; a value input has only one link, linking it again replaces the old link (trigger inputs can have many). undoable as one step.", { "opId1": param.opId().describe("id of the op with the output port"), "portName1": param.portName().describe("output port name, e.g. \"Next\" or \"Result\""), "opId2": param.opId().describe("id of the op with the input port"), "portName2": param.portName().describe("input port name, e.g. \"Exec\" or \"Value\"") },
        ({ opId1, portName1, opId2, portName2 }) =>
        {
            logMcp("link " + opLabel(opId1) + "." + portName1 + " -> " + opLabel(opId2) + "." + portName2);

            try
            {
                return respondText(linkPortsChecked(opId1, portName1, opId2, portName2));
            }
            catch (e)
            {
                return respondError(e.message);
            }
        }
    );

    server.tool(
        "unlink-ports",
        "remove an existing link between two ports (the inverse of link-ports); identify ops by id and ports by name. fails if no such link exists.", { "opId1": param.opId().describe("id of the op with the output port"), "portName1": param.portName().describe("output port name"), "opId2": param.opId().describe("id of the op with the input port"), "portName2": param.portName().describe("input port name") },
        ({ opId1, portName1, opId2, portName2 }) =>
        {
            logMcp("unlink " + opLabel(opId1) + "." + portName1 + " -> " + opLabel(opId2) + "." + portName2);

            const op1 = CABLES.patch.getOpById(opId1);
            const op2 = CABLES.patch.getOpById(opId2);
            if (!op1 || !op2) return respondError("no op found with id " + (!op1 ? opId1 : opId2));

            const port1 = op1.getPort(portName1);
            const port2 = op2.getPort(portName2);
            if (!port1 || !port2) return respondError("no port named \"" + (!port1 ? portName1 : portName2) + "\" on op " + (!port1 ? opId1 : opId2));

            const existing = port1.links.find((l) => l.getOtherPort(port1) === port2);
            if (!existing) return respondError("no link found between " + opId1 + "." + portName1 + " and " + opId2 + "." + portName2);

            existing.remove();

            return respondText("unlinked " + opId1 + "." + portName1 + " -> " + opId2 + "." + portName2);
        }
    );

    server.tool(
        "perf-profiler-read",
        "read the patch's perf profiler (the per-frame durations and counts the code reports with perfProfiler.setDuration/addCount, e.g. \"timeline cpu\" or \"<canvas> gpu\" from gl timer queries): per name the average, max and last value over the kept frames (default 120). optional filter only lists names containing that text.", { "filter": param.filter() },
        ({ filter }) =>
        {
            logMcp("perf profiler read");

            const profiler = CABLES.patch.perfProfiler;
            const summarize = (frames, key) =>
            {
                const values = frames.map((f) => f[key]).filter((v) => typeof v == "number");
                if (!values.length) return null;
                const sum = values.reduce((a, b) => a + b, 0);
                return { "avg": round3(sum / values.length), "max": round3(Math.max(...values)), "last": round3(values[values.length - 1]), "frames": values.length };
            };

            const result = { "durationsMs": {}, "counts": {} };
            for (const name in profiler.durationsFrames)
                if (!filter || name.includes(filter)) result.durationsMs[name] = summarize(profiler.durationsFrames[name], "ms");
            for (const name in profiler.countsFrames)
                if (!filter || name.includes(filter)) result.counts[name] = summarize(profiler.countsFrames[name], "num");

            const glPatch = gui.patchView._patchRenderer;
            if (glPatch) result.uiThrottle = { "targetFps": glPatch.targetFps || 0, "mouseOverCanvas": glPatch.mouseState.mouseOverCanvas, "note": "targetFps 0 = full rate. the patch field, vizlayer and timeline skip frames when inactive (mouse not over the patch field), so a low \"ui fps\" with targetFps > 0 is throttling, not load. users can turn it off in the preferences (UI Eco Mode)" };

            return respondText(JSON.stringify(result));
        }
    );

    server.tool(
        "patch-profiler-read",
        "per-op cpu cost of the running patch (the same data as the Patch Profiler tab): starts op profiling if needed (it stays active with a small overhead until the editor reloads), waits durationMs (default 3000) and lists the most expensive ops: ms per second, peak ms of one call, triggers in the last frame, op name, title and subpatch. limit is the number of ops (default 30).", { "durationMs": z.number().optional().describe("how long to measure in ms, default 3000"), "limit": param.limit(30) },
        async ({ durationMs, limit }) =>
        {
            logMcp("patch profiler read");

            const patch = gui.corePatch();
            if (!patch.profiler || !patch.profilerStartedByMcp)
            {
                patch.profile(true);
                patch.profilerStartedByMcp = true;
            }
            patch.profiler.clear();

            await new Promise((resolve) => { setTimeout(resolve, durationMs || 3000); });

            const items = patch.profiler.getItems();
            const perOp = {};
            for (const id in items)
            {
                const item = items[id];
                if (!perOp[item.opid]) perOp[item.opid] = { "msPerSecond": 0, "peakMs": 0, "triggers": 0, "ports": [] };
                const entry = perOp[item.opid];
                entry.msPerSecond += item.timePsMs || 0;
                entry.peakMs = Math.max(entry.peakMs, item.peak || 0);
                entry.triggers += item.numTriggers || 0;
                entry.ports.push(item.title);
            }

            let totalMsPerSecond = 0;
            const list = [];
            for (const opid in perOp)
            {
                const op = patch.getOpById(opid);
                const entry = perOp[opid];
                totalMsPerSecond += entry.msPerSecond;
                list.push(
                {
                    "opId": opid,
                    "objName": op ? op.objName : "?",
                    "title": op ? op.getTitle() : "",
                    "subPatch": op ? op.uiAttribs.subPatch : "",
                    "msPerSecond": round3(entry.msPerSecond),
                    "peakMs": round3(entry.peakMs),
                    "triggers": entry.triggers
                });
            }
            list.sort((a, b) => b.msPerSecond - a.msPerSecond);

            return respondText(JSON.stringify({ "profiledOps": list.length, "totalMsPerSecond": round3(totalMsPerSecond), "ops": list.slice(0, limit || 30) }));
        }
    );

    server.tool(
        "debug-glop",
        "for cables developers only: debug info of the patch field drawing of an op (size, area size). not needed to build patches.", { "opId": param.opId() },
        ({ opId }) =>
        {
            if (opId == "scripts")
            {
                const srcs = [...document.querySelectorAll("script")].map((s) => s.src).filter((s) => s);
                return (async () =>
                {
                    const out = [];
                    for (const s of srcs)
                    {
                        if (!s.includes("cables.ui")) { out.push(s); continue; }
                        const t = await (await fetch(s)).text();
                        out.push(s + " len " + t.length + " findCycleLinks " + t.includes("findCycleLinks") + " fan( " + t.includes("#fan("));
                    }
                    return respondText(out.join("\n"));
                })();
            }
            if (opId == "tidy")
            {
                gui.patchView.tidyUpOps(gui.patchView.getSelectedOps());
                const msgs = [...document.querySelectorAll(".iziToast")].map((el) => el.textContent);
                return respondText(JSON.stringify(msgs));
            }
            const o = CABLES.patch.getOpById(opId);
            if (!o) return respondError("no op " + opId);
            const g = gui.patchView.patchRenderer.getGlOp(o);
            const ra = g ? (g.resizableArea || g._resizableArea) : null;
            return respondText(JSON.stringify(
            {
                "translate": o.uiAttribs.translate,
                "hasArea": o.uiAttribs.hasArea,
                "area": o.uiAttribs.area,
                "glop": g ? { "w": g.w, "h": g.h, "visible": g.visible, "posZ": g.getPosZ(), "hasResizableAreaGetter": "resizableArea" in g } : null,
                "resizableArea": ra ? { "w": ra.w, "h": ra.h, "_w": ra._w, "_h": ra._h } : null,
                "ports": g ? o.portsIn.concat(o.portsOut).map((p) =>
                {
                    const gp = g.getGlPort(p.name);
                    if (!gp) return p.name + ": no glport";
                    const r = gp.rect;
                    if (!r) return p.name + ": no rect";
                    const rd = gui.patchView.patchRenderer.rectDrawer;
                    const buf = rd ? " buffer size " + rd._attrBuffSizes[r.idx * 2] + "x" + rd._attrBuffSizes[r.idx * 2 + 1] + " pos " + rd._attrBuffPos[r.idx * 3] + "," + rd._attrBuffPos[r.idx * 3 + 1] + "," + rd._attrBuffPos[r.idx * 3 + 2] + " col a " + rd._attrBuffCol[r.idx * 4 + 3] + " shape " + rd._attrBuffDeco[r.idx * 4] : "";
                    return p.name + ": idx " + r.idx + " x " + r.x + " y " + r.y + " w " + r.w + " h " + r.h + " visible " + r.visible + " absZ " + r.absZ + (p.uiAttribs.hidePort ? " hidePort" : "") + buf;
                }) : null,
                "rectDrawerNumRects": gui.patchView.patchRenderer.rectDrawer ? gui.patchView.patchRenderer.rectDrawer.getNumRects() : null,
                "rectDrawerBufferSize": gui.patchView.patchRenderer.rectDrawer ? gui.patchView.patchRenderer.rectDrawer._attrBuffPos.length / 3 : null,
                "tidyUpOps": String(gui.patchView.tidyUpOps).substring(0, 300)
            }));
        }
    );

    server.tool(
        "set-op-comment",
        "set the comment of an op in the patch by its id, shown next to its title in the patch editor (the same as the comment field in the param panel). an empty comment removes it. undoable.", { "opId": param.opId(), "comment": z.string().describe("comment text, empty string removes it") },
        ({ opId, comment }) =>
        {
            logMcp("comment " + opLabel(opId));

            if (!CABLES.patch.getOpById(opId)) return respondError("no op found with id " + opId);

            setOpCommentUndoable(opId, comment);
            return respondText(comment ? "comment of " + opId + " set" : "comment of " + opId + " removed");
        }
    );

    server.tool(
        "set-op-enabled",
        "enable or disable ops in the patch by their ids, the same as pressing \"d\" (Disable Op) in the patch editor. a disabled op and the ops it triggers do not run, get-patch-overview marks it as disabled.", { "opIds": z.array(param.opId()).describe("ids of the ops to change"), "enabled": z.boolean().describe("true enables the ops, false disables them") },
        ({ opIds, enabled }) =>
        {
            logMcp((enabled ? "enable " : "disable ") + opIds.length + " ops");

            for (let i = 0; i < opIds.length; i++)
                if (!CABLES.patch.getOpById(opIds[i])) return respondError("no op found with id " + opIds[i]);

            for (let i = 0; i < opIds.length; i++) CABLES.patch.getOpById(opIds[i]).setUiAttribs({ "disabled": !enabled });
            gui.opParams.refresh();
            return respondText((enabled ? "enabled " : "disabled ") + opIds.join(", "));
        }
    );

    server.tool(
        "add-op",
        "add a new op to the current patch by its full op name (objName), e.g. Ops.Anim.Timer_v2; get valid names from search-ops. extension and team ops (Ops.Extension.*, Ops.Team.*) are found by search-ops only as their collection until it is loaded: add-op with the full op name loads it. returns the new op's id (use it with link-ports / set-port-value) and its port names. leave x/y out: link-ports then places the op below the op linked to its input (or above the op it feeds), cables flow from top to bottom. only give x/y when the user asks for a position. to add several ops use batch-add-ops instead.", { "objName": param.opName(), "x": z.number().optional().describe("only when the user asks for a position: x in patch coordinates"), "y": z.number().optional().describe("only when the user asks for a position: y in patch coordinates") },
        async ({ objName, x, y }) =>
        {
            logMcp("add op " + objName);

            let newOp;
            try
            {
                newOp = await addOpChecked(objName, x, y);
            }
            catch (e)
            {
                return respondError(e.message);
            }

            const portsIn = newOp.portsIn.map((p) => p.name);
            const portsOut = newOp.portsOut.map((p) => p.name);

            return respondText("added " + objName + " with id " + newOp.id + "; portsIn: [" + portsIn.join(", ") + "]; portsOut: [" + portsOut.join(", ") + "]");
        }
    );

    server.tool(
        "delete-op",
        "delete an op instance from the current patch, its links are removed too. this does not delete the op type or its code files.", { "opId": param.opId() },
        ({ opId }) =>
        {
            logMcp("delete " + opLabel(opId));

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);

            const objName = targetOp.objName;

            CABLES.patch.deleteOp(opId);
            const stillThere = !!CABLES.patch.getOpById(opId);

            if (stillThere) return respondError("could not delete op " + opId);
            return respondText("deleted " + objName + " (" + opId + ")");
        }
    );

    server.tool(
        "save-patch",
        "save the current patch to disk/server, the same as the editor's own save action (ctrl+s). skips confirmation dialogs since there is no user to click through them.", {},
        async () =>
        {
            logMcp("save patch");

            try
            {
                await savePatch();
                return respondText("patch saved");
            }
            catch (e)
            {
                return respondError("save failed: " + e.message);
            }
        }
    );

    server.tool(
        "upload-patch",
        "upload the current patch json (ops and ui, no op code or asset files) to cables.gl, with the cables.gl api key from the standalone preferences. without projectId a new private patch is created, with it that patch on cables.gl is overwritten. unsaved changes are saved first. fails if the patch uses Ops.Local ops, they do not exist on cables.gl. this mcp server op and the ops linked to it are left out. description, tags, licence and visibility set the patch settings after uploading. returns the patch id and its editor url.",
        {
            "projectId": z.string().optional().describe("id of a patch on cables.gl to overwrite (from an earlier upload-patch), leave out to create a new one"),
            "server": z.string().optional().describe("cables server url, e.g. https://cables.gl, default the standalone's configured communityUrl (cables_electron/cables.json)"),
            "description": z.string().optional().describe("patch description shown in the patch settings, markdown"),
            "tags": z.string().optional().describe("comma separated tags/keywords of the patch"),
            "licence": z.enum(["none", "copyright", "cc0", "cc-by", "cc-by-sa", "cc-by-nd", "cc-by-nc", "cc-by-nc-sa", "cc-by-nc-nd"]).optional().describe("patch licence, cc0 is public domain"),
            "visibility": z.enum(["private", "unlisted", "public"]).optional().describe("who can see the patch: private, unlisted (anyone with the link) or public"),
            "name": z.string().optional().describe("patch name on cables.gl, default the current patch title (set-patch-name)")
        },
        async ({ projectId, server, description, tags, licence, visibility, name }) =>
        {
            logMcp("upload patch" + (projectId ? " to " + projectId : "") + (server ? " on " + server : ""));

            // When overwriting an existing server patch, omitting `name` must
            // preserve its server-side title.  The standalone editor title
            // may belong to a different example and must not overwrite it.
            const patchSettings = {};
            if (name !== undefined) patchSettings.name = name;
            if (description !== undefined) patchSettings.description = description;
            if (tags !== undefined) patchSettings.tags = tags;
            if (licence !== undefined) patchSettings.licence = licence;
            if (visibility !== undefined) patchSettings.visibility = visibility;

            try
            {
                await savePatch();

                const result = await new Promise((resolve, reject) =>
                {
                    CABLESUILOADER.talkerAPI.send("uploadPatchToServer", { "projectId": projectId, "server": server, "settings": patchSettings, "excludeOpIds": Array.from(mcpBranchOpIds()) }, (err, rslt) =>
                    {
                        if (!err && !rslt) reject(new Error("no answer from the standalone, its main process does not know uploadPatchToServer yet, restart the app"));
                        else if (!err) resolve(rslt.data);
                        else if (err.msg == "LOCAL_OPS") reject(new Error("the patch uses local ops, they do not exist on cables.gl: " + err.data.localOps.join(", ")));
                        else reject(new Error(err.msg + (err.data ? ": " + (typeof err.data == "string" ? err.data : JSON.stringify(err.data)) : "")));
                    });
                });

                return respondText((result.created ? "created" : "updated") + " patch " + result.projectId + ": " + result.url);
            }
            catch (e)
            {
                return respondError("upload failed: " + e.message);
            }
        }
    );

    server.tool(
        "add-patch-to-patchlist",
        "add a patch on cables.gl to a patchlist there, with the cables.gl api key from the standalone preferences. the key's user needs write access to the list. adding a patch that is already in the list changes nothing.",
        {
            "listId": z.string().describe("id of the patchlist on cables.gl, the last part of its /patchlist/ url"),
            "projectId": z.string().describe("id of the patch on cables.gl, e.g. the one upload-patch returned"),
            "server": z.string().optional().describe("cables server url, e.g. https://cables.gl, default the standalone's configured communityUrl (cables_electron/cables.json)")
        },
        async ({ listId, projectId, server }) =>
        {
            logMcp("add patch " + projectId + " to patchlist " + listId);

            try
            {
                const result = await new Promise((resolve, reject) =>
                {
                    CABLESUILOADER.talkerAPI.send("addPatchToPatchList", { "listId": listId, "projectId": projectId, "server": server }, (err, rslt) =>
                    {
                        if (!err && !rslt) reject(new Error("no answer from the standalone, its main process does not know addPatchToPatchList yet, restart the app"));
                        else if (!err) resolve(rslt.data);
                        else reject(new Error(err.msg + (err.data ? ": " + (typeof err.data == "string" ? err.data : JSON.stringify(err.data)) : "")));
                    });
                });

                return respondText("added patch " + result.projectId + " to patchlist " + result.listId + ": " + result.url);
            }
            catch (e)
            {
                return respondError("adding to patchlist failed: " + e.message);
            }
        }
    );

    server.tool(
        "upload-patch-assets",
        "upload files from the current patch directory (e.g. ./image.png in file ports) as assets of a patch on cables.gl, with the cables.gl api key from the standalone preferences. upload-patch does not upload asset files, use this afterwards. returns each file's absolute asset url (on the sandbox server, e.g. https://devsandbox.cables.gl/assets/<patch long id>/<filename>); set file ports to it so the patch works in the standalone and on the website, then upload the patch again.",
        {
            "projectId": z.string().describe("id of the patch on cables.gl, e.g. the one upload-patch returned"),
            "files": z.array(z.string()).describe("file names in the patch directory, e.g. [\"reference.png\"], a leading ./ is ignored"),
            "server": z.string().optional().describe("cables server url, e.g. https://cables.gl, default the standalone's configured communityUrl (cables_electron/cables.json)"),
            "assetServer": z.string().optional().describe("url the server's assets are served from, e.g. https://sandbox.cables.gl, default the standalone's configured communitySandboxUrl")
        },
        async ({ projectId, files, server, assetServer }) =>
        {
            logMcp("upload " + files.length + " assets to patch " + projectId);

            try
            {
                const result = await new Promise((resolve, reject) =>
                {
                    CABLESUILOADER.talkerAPI.send("uploadPatchAssetsToServer", { "projectId": projectId, "files": files, "server": server, "assetServer": assetServer }, (err, rslt) =>
                    {
                        if (!err && !rslt) reject(new Error("no answer from the standalone, its main process does not know uploadPatchAssetsToServer yet, restart the app"));
                        else if (!err) resolve(rslt.data);
                        else reject(new Error(err.msg + (err.data ? ": " + (typeof err.data == "string" ? err.data : JSON.stringify(err.data)) : "")));
                    });
                });

                const lines = [];
                for (let i = 0; i < result.files.length; i++) lines.push(result.files[i].filename + " -> " + result.files[i].url);
                return respondText("uploaded " + result.files.length + " files to patch " + result.projectId + ":\n" + lines.join("\n"));
            }
            catch (e)
            {
                return respondError("asset upload failed: " + e.message);
            }
        }
    );

    server.tool(
        "set-patch-name",
        "rename the current patch (its title), the same as the editor's patch title dialog. the new name is stored right away, no save-patch needed.", { "name": z.string().describe("new title of the patch") },
        async ({ name }) =>
        {
            logMcp("set patch name \"" + name + "\"");

            if (!name.trim()) return respondError("patch name must not be empty");

            try
            {
                const newName = await withTimeout(setPatchName(name), 10000, "setProjectName");
                return respondText("patch renamed to \"" + newName + "\"");
            }
            catch (e)
            {
                return respondError("could not rename patch: " + e.message);
            }
        }
    );

    server.tool(
        "list-commands",
        "list the cables editor commands (the same as in the command palette), with category and description. optional str filters by name/category/description. run them with run-command.", { "str": z.string().optional().describe("only list commands whose name, category or description contains this text") },
        ({ str }) =>
        {
            logMcp("list commands" + (str ? " \"" + str + "\"" : ""));

            const filter = (str || "").toLowerCase();
            const cmds = getAllCommands()
                .filter((c) => c && c.func)
                .filter((c) => !filter || ((c.cmd || "") + " " + (c.category || "") + " " + (c.infotext || "")).toLowerCase().indexOf(filter) > -1)
                .map((c) => ({ "name": c.cmd, "category": c.category, "description": c.infotext }));

            return respondText(cmds.length ? JSON.stringify(cmds, null, 1) : "no commands found");
        }
    );

    server.tool(
        "run-command",
        "run a cables editor command by its name, exactly as listed by list-commands (the same as selecting it in the command palette). many commands act on the currently selected ops, select them with select-op first. prefer a dedicated tool when there is one (e.g. upgrade-ops, rename-op, clone-op).", { "name": z.string().describe("exact command name from list-commands, e.g. \"Show timeline\"") },
        async ({ name }) =>
        {
            logMcp("run command \"" + name + "\"");

            const cmd = getAllCommands().find((c) => c && c.cmd == name);
            if (!cmd || !cmd.func) return respondError(cmd ? "command \"" + name + "\" has no function" : "no command named \"" + name + "\", use list-commands");

            try
            {
                const result = await cmd.func();
                return respondText("executed command " + name + (typeof result == "string" && result ? "\n" + result : ""));
            }
            catch (e)
            {
                return respondError("command failed: " + e.message);
            }
        }
    );

    server.tool(
        "set-canvas-size",
        "set the size of the rendering canvas in pixels, the same as the editor's \"change canvas size\" command", { "width": z.number().describe("width in pixels"), "height": z.number().describe("height in pixels") },
        ({ width, height }) =>
        {
            logMcp("set canvas size " + width + "x" + height);

            const w = Math.round(width);
            const h = Math.round(height);

            gui.canvasManager.setSize(w, h);
            if (gui.canvasManager.mode != gui.canvasManager.CANVASMODE_POPOUT)
            {
                gui.rendererWidth = w;
                gui.rendererHeight = h;
            }
            else gui.canvasManager.subWindow.resizeTo(w, h);
            gui.setLayout();

            return respondText("canvas size set to " + w + "x" + h);
        }
    );

    server.tool(
        "get-op-summary-doc",
        "short documentation of an op by its full op name (objName), e.g. Ops.Gl.Meshes.Circle_v2: summary, description and its input and output ports, one per line as \"- name: type - doc\" (select ports list their options). read it before using an op to know its exact port names. get-full-op-docs has the rest (ids, libs, dependencies, raw port layout).", { "objName": param.opName() },
        async ({ objName }) =>
        {
            logMcp("op summary doc " + objName);

            await loadOpDoc(objName);
            const text = getOpSummaryText(objName);
            if (!text) return respondError("no op docs found for \"" + objName + "\", use search-ops to find op names");

            return respondText(text);
        }
    );

    server.tool(
        "get-full-op-docs",
        "all documentation of an op by its full op name (objName) as json: summary, description, port documentation, raw ports layout, libs/dependencies, ids and whether a newer version exists (oldVersion). empty fields are left out. for port names and types get-op-summary-doc is enough.", { "objName": param.opName() },
        async ({ objName }) =>
        {
            logMcp("full op docs " + objName);

            await loadOpDoc(objName);
            const doc = getOpDocData(objName);
            if (!doc) return respondError("no op docs found for \"" + objName + "\", use search-ops to find op names");

            return respondText(JSON.stringify(doc));
        }
    );

    server.tool(
        "list-op-docs",
        "list all documented ops, one per line as \"name: summary\". optional str filters by name/summary. old versions and hidden ops are left out unless includeOld / includeHidden is true. use get-op-summary-doc for the full documentation of an op. to find an op by topic, search-ops ranks the results better.", { "str": z.string().optional().describe("only list ops whose name or summary contains this text"), "includeOld": z.boolean().optional().describe("also list old op versions, default false"), "includeHidden": z.boolean().optional().describe("also list hidden ops, default false") },
        ({ str, includeOld, includeHidden }) =>
        {
            logMcp("list op docs" + (str ? " \"" + str + "\"" : ""));

            const filter = (str || "").toLowerCase();
            const lines = gui.opDocs.getAll()
                .filter((d) => d && d.name)
                .filter((d) => includeOld || !d.oldVersion)
                .filter((d) => includeHidden || !d.hidden)
                .filter((d) => !filter || (d.name + " " + (d.summary || "")).toLowerCase().indexOf(filter) > -1)
                .map((d) => d.name + ": " + (d.summary || ""));

            return respondText(lines.length ? lines.length + " ops\n" + lines.join("\n") : "no ops found");
        }
    );

    server.tool(
        "get-jobs",
        "list what the editor is loading: \"ui\" are editor jobs (the ui loading indicator, e.g. loading op code or docs), \"patch\" are asset loading tasks started by ops in the patch (e.g. textures, files, libs). running entries show how long they have been running, one running for a long time is probably stuck. optional numFinished also lists the most recent finished entries of both with their duration.", { "numFinished": z.number().optional().describe("also list this many recently finished jobs, default 0") },
        ({ numFinished }) =>
        {
            logMcp("get jobs");

            const now = Date.now();
            const last = (arr) => (numFinished ? arr.slice(-numFinished) : []);

            const uiJobs = gui.jobs().getList();
            const ui = {
                "running": uiJobs.filter((j) => !j.finished).map((j) => ({ "id": j.id, "title": j.title, "runningMs": now - j.timeStart })),
                "finished": last(uiJobs.filter((j) => j.finished)).map((j) => ({ "id": j.id, "title": j.title, "durationMs": j.timeEnd - j.timeStart }))
            };

            const patchTask = (t) =>
            {
                const r = { "type": t.type, "name": t.name };
                if (t.op) r.op = { "id": t.op.id, "title": t.op.getTitle() };
                if (t.finished) r.durationMs = t.timeEnd - t.timeStart;
                else r.runningMs = now - t.timeStart;
                return r;
            };
            const patchTasks = gui.corePatch().loading.getList();
            const patch = {
                "running": patchTasks.filter((t) => !t.finished).map(patchTask),
                "finished": last(patchTasks.filter((t) => t.finished)).map(patchTask)
            };

            if (!numFinished)
            {
                delete ui.finished;
                delete patch.finished;
            }

            return respondText(JSON.stringify({ "ui": ui, "patch": patch }, null, 1));
        }
    );

    server.tool(
        "get-build-info",
        "build info of the code that is running in the editor right now (compiled into the bundles, not read from disk): when the ui and core were built and from which git commit. ageSeconds is how long ago that was. use it after reloading the editor to check that a change is live: created has to be newer than the edit. serverStarted is when this mcp server started (changes with every editor reload), loading/runningJobs tell if the editor or patch is still loading.", {},
        () =>
        {
            logMcp("get build info");

            const now = Date.now();
            const describe = (build) =>
            {
                if (!build) return null;
                const r = { "created": build.created, "ageSeconds": Math.round((now - build.timestamp) / 1000) };
                if (build.git) r.git = { "branch": build.git.branch, "commit": build.git.commit, "message": build.git.message };
                return r;
            };

            const loaderInfo = (window.CABLESUILOADER && CABLESUILOADER.buildInfo) || {};

            let runningJobs = 0;
            const uiJobs = gui.jobs().getList();
            for (let i = 0; i < uiJobs.length; i++)
                if (!uiJobs[i].finished) runningJobs++;
            const patchTasks = gui.corePatch().loading.getList();
            for (let i = 0; i < patchTasks.length; i++)
                if (!patchTasks[i].finished) runningJobs++;

            return respondText(JSON.stringify(
            {
                "now": new Date(now).toISOString(),
                "serverStarted": window.cablesMcpServerStarted,
                "loading": runningJobs > 0,
                "runningJobs": runningJobs,
                "ui": describe(CABLES.UI.build || loaderInfo.ui),
                "core": describe(CABLES.build || loaderInfo.core),
                "api": describe(loaderInfo.api)
            }, null, 1));
        }
    );

    server.tool(
        "reload-editor",
        "reload the whole editor page, e.g. to load newly built ui code. this mcp server restarts with it, so the answer only confirms the reload was triggered. afterwards poll get-build-info until it answers again with a newer serverStarted and loading false. with unsaved changes it does not reload (they would be lost) unless unsaved is \"save\" (save the patch first) or \"discard\" (reload without saving, the changes are lost).", { "unsaved": z.enum(["save", "discard"]).optional().describe("what to do with unsaved patch changes: save them first or discard them") },
        async ({ unsaved }) =>
        {
            logMcp("reload editor" + (unsaved ? " (" + unsaved + " unsaved)" : ""));

            const cmd = CABLES.CMD.commands.find((c) => c && c.cmd == "Reload Editor");
            if (!cmd || !cmd.func) return respondError("no \"Reload Editor\" command found");

            if (!gui.savedState.isSaved)
            {
                if (unsaved == "save")
                {
                    try
                    {
                        await savePatch();
                    }
                    catch (e)
                    {
                        return respondError("not reloading, save failed: " + e.message);
                    }
                }
                else if (unsaved == "discard") gui.savedState.setSavedAll("mcp reload-editor");
                else return respondError("not reloading: the patch has unsaved changes, call again with unsaved \"save\" or \"discard\"");
            }

            setTimeout(() => { cmd.func(); }, RELOAD_EDITOR_DELAY_MS);
            return respondText(JSON.stringify({ "reloading": true, "serverStarted": window.cablesMcpServerStarted }));
        }
    );

    server.tool(
        "ui-profiler-start",
        "clear the editor's ui profiler and start measuring from now on (the same data as the ui profiler tab). every gui.uiProfiler.start(name)/finish() in the ui code is one measurement. do the actions to measure afterwards (e.g. select ops, drag, reload), then read the result with ui-profiler-read.", {},
        () =>
        {
            logMcp("ui profiler start");

            gui.uiProfiler.ignore = false;
            gui.uiProfiler.clear();
            window.cablesMcpUiProfilerStarted = performance.now();
            return respondText("ui profiler cleared and measuring");
        }
    );

    server.tool(
        "ui-profiler-read",
        "read the ui profiler measurements since ui-profiler-start: per measured name the count, average/max/last time in ms (over the most recent times the profiler keeps, see keptTimes) and estTotalMs (count * average). sorted by estTotalMs, so the biggest cost is first. optional filter only lists names containing that text, limit the number of entries (default 30).", { "filter": param.filter(), "limit": param.limit(30) },
        ({ filter, limit }) =>
        {
            logMcp("ui profiler read");

            const measures = gui.uiProfiler._measures;
            const entries = [];
            for (const name in measures)
            {
                if (filter && name.indexOf(filter) == -1) continue;

                const times = measures[name].times || [];
                if (!times.length) continue;

                let sum = 0;
                let max = 0;
                for (let i = 0; i < times.length; i++)
                {
                    sum += times[i];
                    max = Math.max(max, times[i]);
                }
                const avg = sum / times.length;
                const round = (v) => Math.round(v * 1000) / 1000;

                const entry = {
                    "name": name,
                    "count": measures[name].count,
                    "avgMs": round(avg),
                    "maxMs": round(max),
                    "lastMs": round(times[times.length - 1]),
                    "estTotalMs": round(avg * measures[name].count),
                    "keptTimes": times.length
                };
                if (measures[name].text) entry.text = measures[name].text;
                entries.push(entry);
            }

            entries.sort((a, b) => b.estTotalMs - a.estTotalMs);

            const result = {
                "measuringMs": window.cablesMcpUiProfilerStarted ? Math.round(performance.now() - window.cablesMcpUiProfilerStarted) : null,
                "numNames": entries.length,
                "entries": entries.slice(0, limit || 30)
            };
            return respondText(JSON.stringify(result, null, 1));
        }
    );

    registerOpFileTools(server);
    registerPatchJsonTools(server);
    registerAnimTools(server);
    registerScreenshotTools(server);
    registerPatchViewTools(server);
    registerTidyUpTools(server);
    registerBatchTools(server);
    if (isStandalone) registerConsoleTools(server);
    registerPatchInfoTools(server);

    return server;
}

function readJsonBody(req)
{
    return new Promise((resolve, reject) =>
    {
        const chunks = [];
        req.on("data", (chunk) => { chunks.push(chunk); });
        req.on("end", () =>
        {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
            catch (e) { reject(e); }
        });
        req.on("error", reject);
    });
}

const httpServer = isStandalone ? http.createServer(async (req, res) =>
{
    if (req.url !== "/mcp")
    {
        res.writeHead(404).end();
        return;
    }

    if (req.method == "GET")
    {
        window.cablesMcpStreams++;
        updateMenubarConnected();
        res.on("close", () =>
        {
            window.cablesMcpStreams--;
            updateMenubarConnected();
        });
    }

    const mcpServer = buildMcpServer();
    const transport = new StreamableHTTPServerTransport.StreamableHTTPServerTransport({ "sessionIdGenerator": undefined });

    res.on("close", () =>
    {
        transport.close();
        mcpServer.close();
    });

    await mcpServer.connect(transport);

    if (req.method != "POST")
    {
        await transport.handleRequest(req, res);
        return;
    }

    let body = null;
    try
    {
        body = await readJsonBody(req);
    }
    catch (e)
    {
        res.writeHead(400).end("invalid json");
        return;
    }
    await transport.handleRequest(req, res, body);
}) : null;

// close() only stops accepting new connections and calls back once all open ones are gone,
// keep-alive connections of the mcp client would keep the port busy, so they are closed right away
function stopServer(server)
{
    console.log("stop mcp")
    return new Promise((resolve) =>
    {
        if (!server || !server.listening) { resolve(); return; }

        server.close(() => { resolve(); });
        if (server.closeAllConnections) server.closeAllConnections();
    });
}

// the port can still be in use for a moment after the previous server was stopped, so retry instead of giving up
const instanceToken = {};
window.cablesMcpInstance = instanceToken;

function isCurrentInstance()
{
    return window.cablesMcpInstance === instanceToken;
}

function listen(retriesLeft)
{
    if (!isCurrentInstance()) return;

    const onListenError = (e) =>
    {
        if (e.code === "EADDRINUSE" && retriesLeft > 0)
        {
            setTimeout(() => { listen(retriesLeft - 1); }, LISTEN_RETRY_MS);
            return;
        }
        logStatus("mcp server error: " + e.message);
    };

    httpServer.once("error", onListenError);
    httpServer.listen(MCP_PORT, () =>
    {
        httpServer.off("error", onListenError);
        if (!isCurrentInstance())
        {
            stopServer(httpServer);
            return;
        }
        httpServer.on("error", (e) => { logStatus("mcp server error: " + e.message); });

        window.cablesMcpHttpServer = httpServer;
        window.cablesMcpServerStarted = new Date().toISOString();

        // any reload while the server runs (new ui build, lost connection) would otherwise block on the native leave dialog, and this server with it
        gui.savedState.leaving = true;
        window.cablesMcpServerStarts = (window.cablesMcpServerStarts || 0) + 1;

        let startLog = "mcp server " + (window.cablesMcpServerStarts > 1 ? "restarted" : "started") + " on port " + MCP_PORT;
        if (window.cablesMcpServerStarts == 1) startLog += ", " + Object.keys(currentServer._registeredTools).length + " tools";
        logStatus(startLog);
        console.log("MCP server listening on http://localhost:" + MCP_PORT + "/mcp");
        outStarted.set(true);
        op.setUiAttrib({ "extendTitle": "called " + window.cablesMcpCallCount + "x" });
        showMenubarIcon(true);
    });
}

// a deleted server op keeps running until another instance takes over, then it closes what is left of it
if (window.cablesMcpReleaseDeleted) window.cablesMcpReleaseDeleted();
window.cablesMcpReleaseDeleted = null;

// start capturing right away so messages from before the first get-console-logs call are kept, without the debug port there is nothing to capture
if (isStandalone) connectDevTools().catch(() => {});

// after an op reload the server of the previous instance may still be running, it has to release the port first
op.startMcpServer = () =>
{
    window.cablesMcpInstance = instanceToken;
    window.cablesMcpStopped = false;
    if (!isStandalone)
    {
        window.cablesMcpRegistry = currentServer;
        logStatus("mcp tools ready (web, no transport yet), " + Object.keys(currentServer._registeredTools).length + " tools");
        outStarted.set(true);
        return;
    }
    stopServer(window.cablesMcpHttpServer).then(() => { listen(LISTEN_MAX_RETRIES); });
};

// a stopped server stays stopped, also when the op is reloaded or added again, until Restart Server is pressed
function stopMcpServer()
{
    window.cablesMcpStopped = true;
    window.cablesMcpInstance = null;
    outStarted.set(false);
    op.setUiAttrib({ "extendTitle": "stopped" });
    showMenubarIcon(false);

    const server = window.cablesMcpHttpServer;
    window.cablesMcpHttpServer = null;
    stopServer(server).then(() => { logStatus("mcp server stopped"); });
}

window.cablesMcpControl = { "stop": stopMcpServer, "restart": op.startMcpServer };
window.cablesMcpShowLog = showLogTab;

inStop.onTriggered = stopMcpServer;
inRestart.onTriggered = op.startMcpServer;
inShowLog.onTriggered = showLogTab;

// mcp json-rpc messages come in and go out through ports, e.g. linked to socketcluster receive/send object ops
let portRegistry = null;
inHandleRequest.onTriggered = () =>
{
    if (window.cablesMcpStopped) return;
    if (!portRegistry) portRegistry = isStandalone ? buildMcpServer(true) : currentServer;

    const info = { "name": "cables mcp server", "version": "1.0.0", "instructions": SERVER_INSTRUCTIONS };
    portRegistry.handleMessage(inRequest.get(), info).then((response) =>
    {
        if (!response) return;
        outResponse.setRef(response);
        outResponseReady.trigger();
    });
};

if (window.cablesMcpStopped)
{
    op.setUiAttrib({ "extendTitle": "stopped" });
    logStatus("mcp server is stopped, press Restart Server to start it");
}
else op.startMcpServer();

function checkSingleServerOp()
{
    const serverOps = op.patch.getOpsByObjName(op.objName);
    if (serverOps.length > 1) op.setUiError("multipleServerOps", "there are " + serverOps.length + " " + op.objName + " ops in this patch, only one of them can run the mcp server. delete the others.", 2);
    else op.setUiError("multipleServerOps", null);
}

const opAddedListener = op.patch.on(CABLES.Patch.EVENT_OP_ADDED, checkSingleServerOp);
const opDeletedListener = op.patch.on(CABLES.Patch.EVENT_OP_DELETED, checkSingleServerOp);
checkSingleServerOp();

function closeDevTools()
{
    if (devToolsSocket) devToolsSocket.close();
}

// the editor emits this after it executed changed op code, newOp is empty when no instance of the op is in the patch
const EVENT_OP_RELOADED = "opReloaded";

// a deleted op still running the server would keep the old code, so it adds itself again, the new instance takes over with the new code
function onCodeChangedWhileDeleted(name, newOp)
{
    if (name != op.objName || newOp || !isCurrentInstance()) return;
    logStatus("mcp server code changed, adding the op again to load it");
    op.patch.addOp(op.objName, { "translate": op.uiAttribs.translate, "subPatch": op.uiAttribs.subPatch });
}

// deleting the op (e.g. clearing the patch) keeps its server running, only an op reload replaces it with the new instance
op.onDelete = (reloadingOp) =>
{
    op.patch.off(opAddedListener);
    op.patch.off(opDeletedListener);

    if (!reloadingOp)
    {
        if (isCurrentInstance() && window.cablesMcpHttpServer === httpServer)
        {
            logStatus("mcp server op deleted, the server keeps running");
            const codeListener = op.patch.on(EVENT_OP_RELOADED, (name, newOp) => { onCodeChangedWhileDeleted(name, newOp); });
            window.cablesMcpReleaseDeleted = () =>
            {
                op.patch.off(codeListener);
                closeDevTools();
            };
        }
        else closeDevTools();
        return;
    }

    if (window.cablesMcpHttpServer === httpServer) window.cablesMcpHttpServer = null;
    if (isCurrentInstance()) window.cablesMcpInstance = null;
    closeDevTools();
    stopServer(httpServer).then(() => { console.log("Server closed"); });
};
