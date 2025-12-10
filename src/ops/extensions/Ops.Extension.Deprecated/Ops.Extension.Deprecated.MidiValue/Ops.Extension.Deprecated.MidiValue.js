let eventIn = op.addInPort(new CABLES.Port(this, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));

let note = op.addInPort(new CABLES.Port(this, "note"));
let channel = op.inValueInt("Channel", 0);
let learn = op.addInPort(new CABLES.Port(this, "learn", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

let eventOut = op.addOutPort(new CABLES.Port(this, "Event Output", CABLES.OP_PORT_TYPE_OBJECT));
let value = op.addOutPort(new CABLES.Port(this, "value"));

note.set(60);
value.set(0);

let learning = false;
learn.onTriggered = function () { learning = true; };
op.onLoaded = initMidiValue;

let lastEvent = null;

function setMidiValue()
{
    if (lastEvent && lastEvent.output)
    {
        let noteOnMessage = [0xB0, note.get(), parseInt(value.get() * 127, 10)];
        lastEvent.output.send(noteOnMessage);
        return true;
    }
    return false;
}

function initMidiValue()
{
    if (!setMidiValue()) setTimeout(initMidiValue, 300);
}

eventIn.onChange = function ()
{
    let event = eventIn.get();
    if (!event) return;
    if (learning)
    {
        note.set(event.note);
        channel.set(event.channel);
        learning = false;

        if (CABLES.UI)
        {
            op.uiAttr({ "info": "bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    if (event.note == note.get() && event.channel == channel.get())
    {
        value.set(event.velocity);
    }

    eventOut.set(event);
    lastEvent = event;
};
