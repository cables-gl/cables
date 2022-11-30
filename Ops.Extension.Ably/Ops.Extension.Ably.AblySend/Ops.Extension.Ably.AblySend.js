const inConnection = op.inObject("Connection", null, "Ably");
const inChannel = op.inString("Channel");
const inName = op.inString("Name");
const inString = op.inString("String");
const inNumber = op.inFloat("Number");
const inBool = op.inFloat("Boolean");
const inArray = op.inArray("Array");
const inObject = op.inObject("Object");
const inTrigger = op.inTrigger("Trigger");
const sendTrigger = op.inTriggerButton("Send");

// test

let channel = null;

inChannel.onChange = () =>
{
    if (inConnection.get() && inChannel.get())
    {
        initChannel(inChannel.get());
    }
};

sendTrigger.onTriggered = () =>
{
    op.log("sending", inArray.get());
    if (inString.get())
    {
        publish(inName.get(), {
            "type": "string",
            "value": inString.get()
        });
    }
    if (inNumber.get())
    {
        publish(inName.get(), {
            "type": "float",
            "value": inNumber.get()
        });
    }
    if (inBool.get())
    {
        publish(inName.get(), {
            "type": "bool",
            "value": inBool.get()
        });
    }
    if (inArray.get())
    {
        op.log("publish array", inArray.get());
        publish(inName.get(), {
            "type": "array",
            "value": inArray.get()
        });
    }
    if (inObject.get())
    {
        publish(inName.get(), {
            "type": "object",
            "value": inObject.get()
        });
    }
};

inTrigger.onTriggered = () =>
{
    publish(inName.get, {
        "type": "trigger",
        "value": true
    });
};

function initChannel(name)
{
    if (!name) return;
    if (!inConnection.get()) return;
    const ablyInstance = inConnection.get();
    if (ablyInstance && ablyInstance.channels)
    {
        channel = ablyInstance.channels.get(inChannel.get());
    }
}

function publish(name, value)
{
    if (inConnection.get())
    {
        if (!channel) initChannel(inChannel.get());
        if (channel)
        {
            op.log("publishing", inChannel.get(), name, value);
            channel.publish(name, value);
        }
    }
}
