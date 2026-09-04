let eventIn = op.addInPort(new CABLES.Port(this, "Event Input", CABLES.Port.TYPE_OBJECT));

let eventOut = op.addOutPort(new CABLES.Port(this, "Event Output", CABLES.Port.TYPE_OBJECT));

let outDevice = op.addOutPort(new CABLES.Port(this, "Device", CABLES.Port.TYPE_VALUE));
let outNote = op.addOutPort(new CABLES.Port(this, "Note", CABLES.Port.TYPE_VALUE));
let outVelocity = op.addOutPort(new CABLES.Port(this, "Velocity", CABLES.Port.TYPE_VALUE));
let outChannel = op.addOutPort(new CABLES.Port(this, "Channel", CABLES.Port.TYPE_VALUE));
let outCmd = op.addOutPort(new CABLES.Port(this, "Cmd", CABLES.Port.TYPE_VALUE));
let outType = op.addOutPort(new CABLES.Port(this, "Type", CABLES.Port.TYPE_VALUE));
let outTrigger = op.outTrigger("Event Received");

eventIn.onChange = function ()
{
    let event = eventIn.get();
    if (!event) return;

    outDevice.set(event.deviceName);
    outNote.set(event.note);
    outChannel.set(event.channel);
    outVelocity.set(event.velocity);
    outCmd.set(event.cmd);
    outType.set(event.type);

    eventOut.set(event);
    outTrigger.trigger();
};
