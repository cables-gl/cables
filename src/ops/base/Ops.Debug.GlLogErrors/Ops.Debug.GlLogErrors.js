const
    exec = op.inTrigger("Exec"),
    inLimit = op.inInt("Limit Error Logs Num", 1),
    inStop = op.inBool("Stop trigger after limit", false),
    inShowHistory = op.inTriggerButton("show gl history"),
    next = op.outTrigger("Next");

const gl = op.patch.cgl.gl;
const cgl = op.patch.cgl;

const originals = {};
let shouldStart = true;
let count = 0;
let errorCount = 0;
let history = [];
let countFrames = 0;

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    end();
    shouldStart = true;
};

let showHistory = false;

inShowHistory.onTriggered = () =>
{
    showHistory = true;
};

let glConsts = {};

for (let i in op.patch.cgl.gl)
{
    if (i == i.toUpperCase() && typeof op.patch.cgl.gl[i] == "number")
    {
        glConsts[op.patch.cgl.gl[i]] = i;
    }
}

op.patch.cgl.on("webglcontextlost", () =>
{
    console.log(getHistoryAsString());
});

function showCodeModal(title, code, type)
{
    if (!CABLES.UI || !CABLES.UI.ModalDialog)
    {
        console.log(title, code);
    }

    let html = "";
    html += "<h2>Code</h2>";
    html += "<b>" + title + "</b> ";
    html += "<br/><br/>";
    html += "<br/><br/>";

    code = code || "";
    code = code.replace(/\</g, "&lt;"); // for <
    code = code.replace(/\>/g, "&gt;"); // for >

    html += "<pre><code class=\"" + (type || "javascript") + "\">" + code + "</code></pre>";

    new CABLES.UI.ModalDialog({
        "title": title,
        "html": html
    });

    Array.from(document.querySelectorAll("pre code")).forEach(function (block)
    {
        hljs.highlightBlock(block);
    });
}

exec.onTriggered = function ()
{
    count = 0;
    if (shouldStart) start();

    if (errorCount >= inLimit.get() && inStop.get()) return;

    next.trigger();

    countFrames++;
    shouldStart = false;

    if (showHistory)
    {
        if (CABLES.UI) showCodeModal("gl history", getHistoryAsString(), "javascript");

        showHistory = false;
    }
    history.length = 0;
};

function glGetError()
{
    return op.patch.cgl.gl.getError();
    // return originals["getError"].apply(this, arguments);
}

function getHistoryString(i)
{
    let str = history[i].f + "( ";
    for (let j in history[i].a)
    {
        if (j != 0)str += ", ";

        const typ = typeof history[i].a[j];

        if (typ == "number" || typ == "boolean")
        {
            let argStr = history[i].a[j];

            if (glConsts[history[i].a[j]]) argStr = "gl." + glConsts[history[i].a[j]];
            str += argStr;
        }
        else if (typ == "string")
        {
            let argStr = history[i].a[j] + "";
            if (argStr.length > 20)argStr = argStr.substr(0, 20) + "...\"";
            argStr = argStr.replace(/(\r\n|\n|\r)/gm, "");

            str += "\"" + argStr + "\"";
        }
        else
        {
            let argStr = "";
            if (history[i].a[j] instanceof Float32Array) argStr = "{Float32Array(" + history[i].a[j].length + ")}";
            else if (history[i].a[j] instanceof Uint16Array) argStr = "{Uint16Array(" + history[i].a[j].length + ")}";
            else if (history[i].a[j] instanceof Uint8Array) argStr = "{Uint8Array(" + history[i].a[j].length + ")}";
            else argStr = JSON.stringify(history[i].a[j]) + "";

            if (argStr == "{}") argStr = history[i].a[j];

            if (argStr.length > 20)argStr = argStr.substr(0, 20) + "...";
            str += argStr;
        }
    }
    str += " );";
    return str;
}

function getHistoryAsString()
{
    let str = "";
    for (let i = 0; i < history.length; i++)
    {
        str += "gl." + getHistoryString(i) + "\n";
    }
    return str;
}

function profile(func, funcName)
{
    return function ()
    {
        if (op.patch.cgl.aborted) return;
        if (errorCount >= inLimit.get()) return;

        count++;
        // const start = performance.now(),
        let returnVal = func.apply(this, arguments);

        history.push({ "f": funcName, "a": arguments });

        // op.patch.cgl.gl.getError();
        const error = glGetError();

        if (error != gl.NO_ERROR)
        {
            let errStr = "";
            if (error == gl.OUT_OF_MEMORY) errStr = "OUT_OF_MEMORY";
            if (error == gl.INVALID_ENUM) errStr = "INVALID_ENUM";
            if (error == gl.INVALID_OPERATION) errStr = "INVALID_OPERATION";
            if (error == gl.INVALID_FRAMEBUFFER_OPERATION) errStr = "INVALID_FRAMEBUFFER_OPERATION";
            if (error == gl.INVALID_VALUE) errStr = "INVALID_VALUE";
            if (error == gl.CONTEXT_LOST_WEBGL)
            {
                this.aborted = true;
                errStr = "CONTEXT_LOST_WEBGL";
            }
            if (error == gl.NO_ERROR) errStr = "NO_ERROR";

            console.warn("GL ERROR in frame " + countFrames + ", " + count + "th command: ", funcName);
            console.log("arguments", arguments);

            console.log("gl error [" + this.canvas.id + "]: ", error, errStr);
            op.patch.printTriggerStack();
            console.log((new Error()).stack);

            op.patch.printTriggerStack();
            if (errorCount == 0)
            {
                for (let i = 0; i < history.length; i++)
                {
                    let str = getHistoryString(i);
                    console.log("[GL] " + i + ": gl." + str);
                }
            }

            const error2 = glGetError();
            console.log("err after", error2);
            errorCount++;

            if (errorCount == inLimit.get()) console.log("gl Errors stopping after " + inLimit.get() + " errors");
        }

        return returnVal;
    };
}

function start()
{
    for (const i in gl)
    {
        if (typeof gl[i] == "function" && i != "getError")
        {
            originals[i] = gl[i];
            const orig = originals[i];

            gl[i] = profile(gl[i], "" + i);
        }
    }
}

function end()
{
    cgl.debugOneFrame = false;
    for (const i in gl)
        if (originals[i] && typeof gl[i] == "function")
            gl[i] = originals[i];
}
