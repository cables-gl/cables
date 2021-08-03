// ws://192.168.1.235

const inUrl = op.inValueString("URL");

const outResult = op.outObject("Result");
const outConnected = op.outValue("Connected");
const outConnection = this.outObject("Connection");

const outReceived = op.outTrigger("Received Data");

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
    if (outConnected.get() && connectedTo == inUrl.get()) return;
    // if(outConnected.get()===true)connection.close();

    if (!inUrl.get() || inUrl.get() === "")
    {
        op.log("websocket: invalid url ");
        outConnected.set(false);
        return;
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    if (!window.WebSocket)
        console.error("Sorry, but your browser doesn't support WebSockets.");

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
            connecting = false;
            outConnected.set(true);
            connectedTo = inUrl.get();
            outConnection.set(connection);
        };

        connection.onmessage = function (message)
        {
            try
            {
                const json = JSON.parse(message.data);
                outResult.set(null);
                outResult.set(json);
                outReceived.trigger();
            }
            catch (e)
            {
                op.log(e);
                op.log("This doesn't look like a valid JSON: ", message.data);
            }
        };
    }
}
