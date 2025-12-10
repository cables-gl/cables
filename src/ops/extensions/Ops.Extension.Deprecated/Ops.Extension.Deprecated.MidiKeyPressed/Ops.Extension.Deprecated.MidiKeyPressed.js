// input ports
let eventIn = op.inObject("Event Input");

// output ports
let eventOut = op.outObject("Event Output");
let outPressed = op.outTrigger("Key Pressed");
let outReleased = op.outTrigger("Key Released");

let outNote = op.outValue("Note");
let outVelocity = op.outValue("Velocity");
let outChannel = op.outValue("Channel");
let outDevice = op.outValue("Device");

let CMD_NOTE_ON = 9;
let CMD_NOTE_OFF = 8;

eventIn.onChange = function ()
{
    let event = eventIn.get();
    if (event && event.cmd == 9 || event.cmd == 8)
    {
        outDevice.set(event.deviceName);
        outNote.set(event.note);
        outChannel.set(event.channel);
        outVelocity.set(event.velocity);
        eventOut.set(event);
        if (event.cmd == 9)
        {
            outPressed.trigger();
        }
        else if (event.cmd == 8)
        {
            outReleased.trigger();
        }
    }
};
