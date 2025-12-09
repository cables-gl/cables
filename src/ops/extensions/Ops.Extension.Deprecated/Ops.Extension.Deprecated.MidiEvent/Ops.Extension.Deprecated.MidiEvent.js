let eventIn = op.addInPort(new CABLES.Port(this, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));

let eventOut = op.addOutPort(new CABLES.Port(this, "Event Output", CABLES.OP_PORT_TYPE_OBJECT));

let outDevice = op.addOutPort(new CABLES.Port(this, "Device", CABLES.OP_PORT_TYPE_VALUE));
let outNote = op.addOutPort(new CABLES.Port(this, "Note", CABLES.OP_PORT_TYPE_VALUE));
let outVelocity = op.addOutPort(new CABLES.Port(this, "Velocity", CABLES.OP_PORT_TYPE_VALUE));
let outChannel = op.addOutPort(new CABLES.Port(this, "Channel", CABLES.OP_PORT_TYPE_VALUE));
let outCmd = op.addOutPort(new CABLES.Port(this, "Cmd", CABLES.OP_PORT_TYPE_VALUE));
let outType = op.addOutPort(new CABLES.Port(this, "Type", CABLES.OP_PORT_TYPE_VALUE));
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
