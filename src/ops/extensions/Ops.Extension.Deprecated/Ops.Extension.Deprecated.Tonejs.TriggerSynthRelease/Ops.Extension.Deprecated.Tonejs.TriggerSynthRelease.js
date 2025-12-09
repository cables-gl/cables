// input
let nodePort = op.inObject("Synth");
let triggerPort = op.addInPort(new CABLES.Port(this, "Trigger Arrack", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let timePort = op.inValueString("Time", "+0");

// change listeners
triggerPort.onTriggered = function ()
{
    let synth = nodePort.get();
    if (synth && synth.triggerRelease)
    {
        let time = timePort.get();

        // check time
        try
        {
            new Tone.TimeBase(time);
        }
        catch (e)
        {
            op.log("Warning: Invalid time, using '+0'");
            time = "+0";
        }

        synth.triggerRelease(time);
        op.uiAttr({ "error": null }); // clear UI error
    }
};
