const
    exec = op.inTrigger("Trigger"),
    inResponse = op.inObject("Response"),
    inBody = op.inString("Body", "");


exec.onTriggered = () =>
{
    const res = inResponse.get();

    if (!res) return;

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(String(inBody.get()));
};
