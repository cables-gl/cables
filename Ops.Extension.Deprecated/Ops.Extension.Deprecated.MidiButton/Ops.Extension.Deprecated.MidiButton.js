let eventIn = op.addInPort(new CABLES.Port(op, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));
let note = op.addInPort(new CABLES.Port(op, "note"));
let channel = op.inValueInt("Channel", 0);
let learn = op.addInPort(new CABLES.Port(op, "learn", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

let eventOut = op.addOutPort(new CABLES.Port(op, "Event Output", CABLES.OP_PORT_TYPE_OBJECT));
let outPressed = op.addOutPort(new CABLES.Port(op, "pressed"));

let trigger = op.outTrigger("trigger");

let lights = op.addInPort(new CABLES.Port(op, "Light", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

note.set(1);
let learning = false;
let lastValue = -1;
learn.onTriggered = function () { learning = true; };

eventIn.onChange = function ()
{
    let event = eventIn.get();
    if (!event) return;
    if (learning)
    {
        channel.set(event.channel);
        note.set(event.note);
        learning = false;

        if (CABLES.UI)
        {
            op.uiAttr({ "info": "bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    if (note.get() == event.note && event.channel == channel.get())
    {
        let v = event.velocity;
        if (v === 0)
        {
            if (lights.get())event.output.send([0x90, note.get(), 0]);
            outPressed.set(false);
        }
        if (v == 1)
        {
            if (lights.get())event.output.send([0x90, note.get(), 120]);
            outPressed.set(true);
            trigger.trigger();
        }
    }
    eventOut.set(event);
};
