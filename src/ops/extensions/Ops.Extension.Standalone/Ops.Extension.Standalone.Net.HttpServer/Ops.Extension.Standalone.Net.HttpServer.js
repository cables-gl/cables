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

    server = http.createServer((req, res) =>
    {
        outRequestUrl.set(req.url);
        outRequestData.set(req);
        outResponse.set(res);

        outRequest.trigger();
    });

    start();
}

function start()
{
    try
    {
        server.listen(inPort.get(), inHost.get(), (e) =>
        {
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
    server.close();
    outRunning.set(false);
}
