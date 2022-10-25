const
    inConnection = op.inObject("Connection", null, "Websocket"),
    inObject = op.inObject("Object"),
    inSend = op.inTriggerButton("Send"),
    inStringify = op.inBool("Send String", true),
    outSent = op.outBoolNum("Sent");

let connection = null;

inConnection.onChange = function ()
{
    connection = inConnection.get();
};

inSend.onTriggered = function ()
{
    if (connection && inObject.get())
    {
        if (inStringify.get())connection.send(JSON.stringify(inObject.get()));
        else connection.send(inObject.get());

        outSent.set(true);
    }
    else
    {
        outSent.set(false);
    }
};
