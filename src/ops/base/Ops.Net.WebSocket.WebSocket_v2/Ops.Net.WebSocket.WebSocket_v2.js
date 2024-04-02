const
    inUrl = op.inString("URL"),
    outResult = op.outObject("Result"),
    outValidJson = op.outBoolNum("Valid JSON"),
    outConnection = op.outObject("Connection", null, "Websocket"),
    outConnected = op.outBoolNum("Connected"),
    outReceived = op.outTrigger("Received Data"),
    outRaw = op.outString("Raw Data");

let connection = null;
let timeout = null;
let connectedTo = "";

inUrl.onChange = connect;
timeout = setTimeout(checkConnection, 2000);

inUrl.set();

let connecting = false;

function checkConnection()
{
    if (!outConnected.get() && !connecting)
    {
        op.log("reconnect websocket...");
        connect();
    }

    timeout = setTimeout(checkConnection, 2000);
}

op.onDelete = function ()
{
    if (outConnected.get())connection.close();
    connecting = false;
    clearTimeout(timeout);
};

function connect()
{
    op.setUiError("connection", null);
    op.setUiError("jsonvalid", null);

    if (outConnected.get() && connectedTo == inUrl.get()) return;

    if (!inUrl.get() || inUrl.get() === "")
    {
        op.log("websocket: invalid url ");
        outConnected.set(false);
        return;
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket)
        op.logError("Sorry, but your browser doesn't support WebSockets.");

    try
    {
        connecting = true;
        if (connection !== null)connection.close();
        connection = new WebSocket(inUrl.get());
    }
    catch (e)
    {
        op.log("could not connect to", inUrl.get());
        connecting = false;
        op.log(e);
    }

    if (connection)
    {
        connection.onerror = function (message)
        {
            connecting = false;
            op.log("ws error");
            outConnected.set(false);
            outConnection.set(null);
            op.setUiError("connection", "Error connecting to websocket server", 2);
        };

        connection.onclose = function (message)
        {
            connecting = false;
            op.log("ws close");
            outConnected.set(false);
            outConnection.set(null);
        };

        connection.onopen = function (message)
        {
            // op.setUiError("connection",null)
            connecting = false;
            outConnected.set(true);
            connectedTo = inUrl.get();
            outConnection.set(connection);
        };

        connection.onmessage = function (message)
        {
            op.setUiError("jsonvalid", null);
            outRaw.set(message.data);
            try
            {
                const json = JSON.parse(message.data);
                outResult.set(null);
                outResult.set(json);
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
