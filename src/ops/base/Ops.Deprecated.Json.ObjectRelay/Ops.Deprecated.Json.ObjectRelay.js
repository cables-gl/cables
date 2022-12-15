// input
let objectInPort = op.inObject("Object In");
let enabledPort = op.inValueBool("Enabled");

// output
let objectOutPort = op.outObject("Object Out");

// change listener
objectInPort.onChange = setOutPort;
enabledPort.onChange = setOutPort;

function setOutPort()
{
    let enabled = enabledPort.get();
    if (enabled)
    {
        objectOutPort.set(objectInPort.get());
    }
    else
    {
        objectOutPort.set(null);
    }
}
