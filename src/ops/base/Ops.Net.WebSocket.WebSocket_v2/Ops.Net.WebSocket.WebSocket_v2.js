const
    inUrl = op.inString("URL"),
    outResult = op.outObject("Result"),
    outValidJson = op.outBoolNum("Valid JSON"),
    outConnection = op.outObject("Connection", null, "Websocket"),
    outConnected = op.outBoolNum("Connected"),
    outReceived = op.outTrigger("Received Data"),
    outRaw = op.outString("Raw Data");

let connection = null;
let timeout = setTimeout(checkConnection, 2000);
let connectedTo = "";

inUrl.onChange = connect;
connect();

let connecting = false;

function checkConnection()
{
    if (!outConnected.get() && !connecting)
    {
        connect();
    }
    timeout = setTimeout(checkConnection, 2000);
}

op.onDelete = function ()
{
    if (outConnected.get() && connection) connection.close();
    connecting = false;
    clearTimeout(timeout);
};

function connect()
{
    outConnected.set(false);

    const url = inUrl.get();
    if (!url) return;

    op.setUiError("connection", null);
    op.setUiError("jsonvalid", null);
    op.setUiError("websocket", null);

    if (outConnected.get() && connectedTo == inUrl.get()) return;

    if (inUrl.get() && !inUrl.get().startsWith("ws://") && !inUrl.get().startsWith("wss://"))
    {
        op.setUiError("wrongproto", "only valid protocols are ws:// or wss:// ");
        return;
    }
    else
    {
        op.setUiError("wrongproto", null);
    }

    if (!inUrl.get() || inUrl.get() === "")
    {
        op.logWarn("websocket: invalid url ");
        return;
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket)
    {
        return op.logError("Sorry, but your browser doesn't support WebSockets.");
    }

    try
    {
        connecting = true;
        if (connection !== null) connection.close();
        connection = new WebSocket(inUrl.get());
    }
    catch (e)
    {
        if (e && e.message) op.setUiError("websocket", e.message);
        op.logWarn("could not connect to", inUrl.get());
        connecting = false;
        outConnected.set(false);
    }

    if (connection)
    {
        connection.onerror = function (e)
        {
            connecting = false;
            outConnected.set(false);
            outConnection.set(null);
        };

        connection.onclose = function (message)
        {
            connecting = false;
            outConnected.set(false);
            outConnection.set(null);
        };

        connection.onopen = function (message)
        {
            connecting = false;
            outConnected.set(true);
            connectedTo = inUrl.get();
            outConnection.set(connection);
        };

        connection.onmessage = function (message)
        {
            op.setUiError("jsonvalid", null);

            outConnected.set(true);
            outRaw.set(message.data);
            try
            {
                const json = JSON.parse(message.data);
                outResult.setRef(json);
                outValidJson.set(true);
            }
            catch (e)
            {
                op.log(e);
                op.log("This doesn't look like a valid JSON: ", message.data);
                op.setUiError("jsonvalid", "Received message was not valid JSON", 0);
                outValidJson.set(false);
            }
            outReceived.trigger();
        };
    }
}
