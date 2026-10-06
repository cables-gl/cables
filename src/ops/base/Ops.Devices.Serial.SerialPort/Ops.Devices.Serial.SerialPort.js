const
    inConnect = op.inTriggerButton("Connect"),
    inBaud = op.inInt("Baud Rate", 115200),

    inData = op.inString("String To Send", ""),
    inSend = op.inTriggerButton("Send"),

    outString = op.outString("Last String"),
    outConnected = op.outBoolNum("Connected"),
    outLinesRec = op.outNumber("Received Lines"),
    outHasError = op.outBoolNum("Has Error"),

    outSupported = op.outBoolNum("Supported"),
    outError = op.outString("Error");

let port = null,
    writer = null,
    reader = null,
    decoder = null,
    buffer = "";

const encoder = new TextEncoder();
const supported = "serial" in navigator;
let recLines = 0;
outSupported.set(supported);
setConnected(false);
if (!supported) setStatus("not supported");

inSend.onTriggered = send;
inConnect.onTriggered = () =>
{
    if (port) return;
    if (!supported) return setError("Web Serial is not supported in this browser");

    setStatus("connecting...");
    navigator.serial.requestPort()
        .then((p) =>
        {
            port = p;
            return port.open({ "baudRate": inBaud.get() });
        })
        .then(() =>
        {
            writer = port.writable.getWriter();
            clearError();
            setConnected(true);
            startReading();
        })
        .catch((e) =>
        {
            setError(e.name + ": " + e.message);
            cleanup();
        });
};

function send()
{
    if (!writer) return;
    writer.write(encoder.encode(inData.get() + "\n")).catch((e) =>
    {
        setError(e.name + ": " + e.message);
    });
}

function startReading()
{
    decoder = new TextDecoder();
    buffer = "";
    reader = port.readable.getReader();
    readChunk();
}

function readChunk()
{
    reader.read()
        .then(({ value, done }) =>
        {
            if (done) return cleanup();

            buffer += decoder.decode(value, { "stream": true });
            const lines = buffer.split("\n");
            buffer = lines.pop();
            if (lines.length) outString.set(lines[lines.length - 1].trim());
            recLines++;
            outLinesRec.set(recLines);

            readChunk();
        })
        .catch((e) =>
        {
            setError(e.name + ": " + e.message);
            cleanup();
        });
}

function cleanup()
{
    if (reader)
    {
        try { reader.releaseLock(); }
        catch (e) {}
        reader = null;
    }
    if (writer)
    {
        try { writer.releaseLock(); }
        catch (e) {}
        writer = null;
    }
    const p = port;
    port = null;
    if (p) p.close().catch(() => {});
    setConnected(false);
}

function setConnected(c)
{
    outConnected.set(c);
    inConnect.setUiAttribs({ "greyout": c });
    inSend.setUiAttribs({ "greyout": !c });
    inData.setUiAttribs({ "greyout": !c });
    if (!outHasError.get()) setStatus(c ? "connected" : "disconnected");
}

function setStatus(s)
{
    op.setUiAttrib({ "extendTitle": s });
}

function setError(msg)
{
    op.setUiError("err", msg);
    outError.set(msg);
    outHasError.set(true);
    setStatus("error");
}

function clearError()
{
    op.setUiError("err", null);

    outError.set("");
    outHasError.set(false);
}

op.onDelete = () =>
{
    if (reader) reader.cancel().catch(() => {});
    else cleanup();
};
