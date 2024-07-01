let eventIn = op.addInPort(new CABLES.Port(this, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));
let value = op.addInPort(new CABLES.Port(this, "Value", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let velocity = op.addInPort(new CABLES.Port(this, "Velocity", CABLES.OP_PORT_TYPE_VALUE));
let note = op.addInPort(new CABLES.Port(op, "note"));
let learn = op.addInPort(new CABLES.Port(op, "learn", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let isControllCMd = op.addInPort(new CABLES.Port(this, "Controll Value", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));

let eventOut = op.addOutPort(new CABLES.Port(this, "Event Output", CABLES.OP_PORT_TYPE_OBJECT));

velocity.set(127);
note.set(1);
let learning = false;
learn.onTriggered = function () { learning = true; };

value.onChange = setValue;

function setValue()
{
    let event = eventIn.get();

    if (event.output)
    {
        let cmd = 0x90;
        if (isControllCMd.get())cmd = 0xb0;

        //   0x80     Note Off
        //   0x90     Note On
        //   0xA0     Aftertouch
        //   0xB0     Continuous controller
        //   0xC0     Patch change
        //   0xD0     Channel Pressure
        //   0xE0     Pitch bend
        //   0xF0     (non-musical commands)

        event.output.send([0x30, note.get(), 0.60]);

        // if(value.get()) event.output.send( [cmd, note.get(), velocity.get()] );
        // else event.output.send( [cmd, note.get(), 4] );
    }
}

eventIn.onChange = function ()
{
    let event = eventIn.get();
    if (learning)
    {
        note.set(event.note);
        learning = false;

        if (event.cmd == 11)isControllCMd.set(true);
        else isControllCMd.set(false);

        setValue();

        if (CABLES.UI)
        {
            op.uiAttr({ "info": "bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    eventOut.set(eventIn.get());
};
