const http = op.require("http");
const socketClusterServer = op.require("socketcluster-server");

const inActive = op.inBool("Active", true);
const inHost = op.inString("Hostname");
const inPort = op.inInt("Port", 8000);
const inPath = op.inString("Path", "/socketcluster/");

const outReceiving = op.outTrigger("Receiving");
const outData = op.outObject("Data", null, "socketcluster-raw-data");
const outListening = op.outBoolNum("Listening", false);
const outClients = op.outNumber("Clients");
const outError = op.outString("Error");

let agServer = null;
let httpServer = http.createServer();
httpServer.on("error", (e) =>
{
    op.setUiError("httperror", e.message, 2);
    outError.set(e.message);
    updateUi();
});

op.onDelete = stopServer;

startServer();

function updateUi()
{
    if (agServer)
    {
        op.setUiAttrib({ "extendTitle": "clients: " + agServer.clientsCount });
        outClients.set(agServer.clientsCount);
    }
    if (!outListening.get() || !agServer)
    {
        op.setUiAttrib({ "extendTitle": "not listening" });
    }
}

function startServer()
{
    op.setUiError("catch2", null);

    if (!httpServer.listening)
    {
        try
        {
            httpServer.listen(inPort.get(), inHost.get(), null, onStart);
        } catch (e)
        {
            op.setUiError("catch2", e.message, 2);
            outError.set(e.message);
            updateUi();
        }
    }

}

function onStart()
{
    if (!inActive.get()) return;

    outListening.set(false);
    op.setUiError("catch1", null);
    op.setUiError("httperror", null);

    try
    {
        agServer = socketClusterServer.attach(httpServer, { "path": inPath.get() });

        agServer.setMiddleware(agServer.MIDDLEWARE_INBOUND, async (middlewareStream) =>
        {
            for await (const action of middlewareStream)
            {
                action.allow();
                outData.setRef({
                    "channel": action.channel,
                    "data": action.data,
                    "type": action.type
                });
                updateUi();
                outReceiving.trigger();
            }

        });

        // SocketCluster/WebSocket connection handling loop.
        (async () =>
        {
            for await (const action of agServer.listener("connection"))
            {
                updateUi();
            }
        })();
        (async () =>
        {
            for await (const action of agServer.listener("closure"))
            {
                updateUi();
            }
        })();
        (async () =>
        {
            for await (const action of agServer.listener("ready"))
            {
                outListening.set(true);
                updateUi();
            }
        })();
    } catch (e)
    {
        op.setUiError("catch1", e.message, 2);
        outError.set(e.message);
        outListening.set(false);
        updateUi();
    }
}

function stopServer()
{
    if (agServer) agServer.close();
    httpServer.close();
    agServer = null;
    outListening.set(false);
    updateUi();
}

inActive.onChange = () =>
{
    if (inActive.get())
    {
        startServer();
    }
    else
    {
        stopServer();
    }
};

