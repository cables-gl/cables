let eventIn = op.inObject("Event Input");
let note = op.addInPort(new CABLES.Port(op, "note"));
let channel = op.inValueInt("Channel", 0);
let learn = op.inTriggerButton("learn");
let eventOut = op.outObject("Event Output");

let value = op.addOutPort(new CABLES.Port(op, "pressed"));

learn.onTriggered = function () { learning = true; };
value.set(false);
note.set(1);

var learning = false;
let lastValue = -1;

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
            op.uiAttr({ "info": "Bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    if (note.get() == event.note && event.channel == channel.get())
    {
        let v = event.velocity;

        if (v == 1 && lastValue != 1)
        {
            value.set(!value.get());
            let noteOnMessage = [0x90, note.get(), 0];
            if (value.get()) noteOnMessage = [0x90, note.get(), 120];

            event.output.send(noteOnMessage);
        }
        lastValue = v;
    }
    eventOut.set(event);
};
