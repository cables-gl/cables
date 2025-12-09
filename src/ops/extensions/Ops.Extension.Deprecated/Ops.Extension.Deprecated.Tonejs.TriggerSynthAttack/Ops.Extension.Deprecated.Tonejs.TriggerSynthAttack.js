// input
let nodePort = op.inObject("Synth");
let triggerPort = op.addInPort(new CABLES.Port(this, "Trigger Arrack", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let notePort = op.inValueString("Note", "C4"); // frequency also works
let velocityPort = op.inValueSlider("Velocity", 1.0);
let timePort = op.inValueString("Time", "+0");

// change listeners
triggerPort.onTriggered = function ()
{
    let synth = nodePort.get();
    if (synth && synth.triggerAttack)
    {
        let note = notePort.get();
        let time = timePort.get();
        let velocity = velocityPort.get();

        // check time
        if (!CABLES.WEBAUDIO.isValidToneTime(time))
        {
            op.uiAttr({ "error": "Invalid time, using '+0'" });
            time = "+0";
        }

        // check tone
        if (!CABLES.WEBAUDIO.isValidToneNote(note))
        {
            op.uiAttr({ "error": "Invalid note, should be either a tone, e.g. \"C4\" or a frequency, e.g. \"440\"" });
            return;
        }

        synth.triggerAttack(note, time, velocity);
        // clear UI error
        op.uiAttr({ "error": null });
    }
};
