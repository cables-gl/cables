// the editor's console via the devtools protocol (needs electron started with --remote-debugging-port)

const DEVTOOLS_PORT = 9222;
const CONSOLE_MAX_ENTRIES = 1000;
const CONSOLE_API_LEVELS = { "debug": "verbose", "trace": "verbose", "warning": "warning", "error": "error", "assert": "error" };
let devToolsConnecting = null;

// console capture through the chrome devtools protocol, the only way to also get browser messages like
// webgl warnings, which never pass through console.*. needs electron started with --remote-debugging-port
function getJson(url)
{
    return new Promise((resolve, reject) =>
    {
        http.get(url, (res) =>
        {
            let body = "";
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () =>
            {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(e); }
            });
        }).on("error", reject);
    });
}

function addConsoleEntry(level, source, text, timestamp, url, line)
{
    const entry = { "timestamp": timestamp || Date.now(), "level": level, "source": source, "text": text };
    if (url) entry.location = url.split("/").pop() + (line !== undefined ? ":" + line : "");

    consoleEntries.push(entry);
    if (consoleEntries.length > CONSOLE_MAX_ENTRIES) consoleEntries.shift();
}

function remoteObjectToString(obj)
{
    if (obj.value !== undefined) return typeof obj.value == "string" ? obj.value : JSON.stringify(obj.value);
    return obj.description || obj.type;
}

// console args as one line, %c styling placeholders and their css arguments are dropped
function consoleArgsToString(args)
{
    const strs = args.map(remoteObjectToString);
    if (strs.length && typeof args[0].value == "string" && args[0].value.includes("%c"))
    {
        const numStyles = args[0].value.split("%c").length - 1;
        strs.splice(1, numStyles);
        strs[0] = strs[0].replace(/%c/g, "");
    }
    return strs.join(" ");
}

function onDevToolsMessage(data)
{
    const msg = JSON.parse(String(data));
    const params = msg.params;

    if (msg.method == "Log.entryAdded")
    {
        const e = params.entry;
        addConsoleEntry(e.level, e.source, e.text, e.timestamp, e.url, e.lineNumber);
    }
    else if (msg.method == "Runtime.consoleAPICalled")
    {
        const frame = params.stackTrace && params.stackTrace.callFrames[0];
        addConsoleEntry(CONSOLE_API_LEVELS[params.type] || "info", "console", consoleArgsToString(params.args), params.timestamp, frame && frame.url, frame && frame.lineNumber + 1);
    }
    else if (msg.method == "Runtime.exceptionThrown")
    {
        const d = params.exceptionDetails;
        addConsoleEntry("error", "exception", d.exception ? d.exception.description : d.text, params.timestamp, d.url, d.lineNumber + 1);
    }
}

async function openDevToolsSocket()
{
    let targets;
    try
    {
        targets = await getJson("http://127.0.0.1:" + DEVTOOLS_PORT + "/json");
    }
    catch (e)
    {
        throw new Error("devtools port " + DEVTOOLS_PORT + " not reachable (" + e.message + "), start electron with: npm run start -- --remote-debugging-port=" + DEVTOOLS_PORT);
    }

    // the editor runs in an iframe of the electron page, its messages arrive through the page's target
    const pageUrl = window.top.location.href.split("#")[0];
    const target = targets.find((t) => t.type == "page" && t.url.split("#")[0] == pageUrl);
    if (!target) throw new Error("no devtools target found for " + pageUrl + ", targets: " + targets.map((t) => t.type + " " + t.url).join(", "));

    const WebSocket = op.require("ws");
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) =>
    {
        socket.once("open", resolve);
        socket.once("error", reject);
    });

    socket.on("message", onDevToolsMessage);
    socket.on("close", () => { if (devToolsSocket === socket) devToolsSocket = null; });

    // enabling replays the messages logged so far, so start with an empty list
    consoleEntries.length = 0;
    let msgId = 0;
    for (const method of ["Log.enable", "Runtime.enable"]) socket.send(JSON.stringify({ "id": ++msgId, "method": method }));

    devToolsSocket = socket;
}

function connectDevTools()
{
    if (devToolsSocket) return Promise.resolve();
    if (!devToolsConnecting) devToolsConnecting = openDevToolsSocket().finally(() => { devToolsConnecting = null; });
    return devToolsConnecting;
}

// registers the tools of this file, called by buildMcpServer
function registerConsoleTools(server)
{
    server.tool(
        "get-console-logs",
        "read the editor's console: console.log/warn/error, uncaught exceptions and browser messages like the yellow webgl warnings (GL_INVALID_OPERATION...). needs electron started with --remote-debugging-port=9222. minLevel: verbose, info, warning or error (default info). optional str filters by text, limit is the number of newest entries (default 100), clear empties the list afterwards.", { "minLevel": z.enum(CONSOLE_LEVELS).optional().describe("lowest level to list, default info; \"error\" for errors only"), "str": z.string().optional().describe("only list entries containing this text"), "limit": param.limit(CONSOLE_DEFAULT_LIMIT), "clear": z.boolean().optional().describe("empty the list afterwards, so the next call only shows new entries") },
        async ({ minLevel, str, limit, clear }) =>
        {
            logMcp("get console logs" + (str ? " \"" + str + "\"" : ""));

            try
            {
                await connectDevTools();
            }
            catch (e)
            {
                return respondError("could not connect to devtools: " + e.message);
            }

            const minIndex = CONSOLE_LEVELS.indexOf(minLevel || "info");
            const filter = (str || "").toLowerCase();
            const lines = consoleEntries
                .filter((e) => CONSOLE_LEVELS.indexOf(e.level) >= minIndex)
                .filter((e) => !filter || e.text.toLowerCase().includes(filter))
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-(limit || CONSOLE_DEFAULT_LIMIT))
                .map((e) => new Date(e.timestamp).toLocaleTimeString() + " " + e.level + " [" + e.source + "] " + e.text + (e.location ? " (" + e.location + ")" : ""));

            if (clear) consoleEntries.length = 0;

            return respondText(lines.length ? lines.join("\n") : "no console entries" + (filter || minLevel ? " matching the filter" : ""));
        }
    );
}
