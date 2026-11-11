const http = op.require("http");

const
    inHost = op.inString("Hostname", "127.0.0.1"),
    inPort = op.inInt("Port", 8080),
    outRequest = op.outTrigger("Trigger Request"),
    outResponse = op.outObject("Response"),
    outRequestUrl = op.outString("Request URL"),
    outRequestData = op.outObject("Request"),
    outRunning = op.outBoolNum("Running");

let server;
if (http)
{
    op.onDelete = stop;
    inPort.onChange = inHost.onChange = restart;

    server = http.createServer((req, res) =>
    {
        outRequestUrl.set(req.url);
        outRequestData.set(req);
        outResponse.set(res);

        outRequest.trigger();
    });

    server.on("error", (e) =>
    {
        outRunning.set(false);
        op.setUiError("listen", e.message);
    });

    start();
}

function start()
{
    try
    {
        server.listen(inPort.get(), inHost.get(), (e) =>
        {
            op.setUiError("listen", null);
            outRunning.set(true);
        });
    }
    catch (e)
    {
        outRunning.set(false);
        op.logWarn(e);
    }
}

function stop()
{
    if (server.listening) server.close();
    outRunning.set(false);
}

function restart()
{
    stop();
    start();
}
