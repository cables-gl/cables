let eventIn = op.addInPort(new CABLES.Port(op, "Event Input", CABLES.OP_PORT_TYPE_OBJECT));

let note = op.addInPort(new CABLES.Port(op, "Note Start"));
let learn = op.addInPort(new CABLES.Port(op, "Learn Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

let noteEnd = op.addInPort(new CABLES.Port(op, "Note End"));
let learnEnd = op.addInPort(new CABLES.Port(op, "Learn End", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

let lights = op.addInPort(new CABLES.Port(op, "Light", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let toggle = op.inValueBool("Toggle");

let inValue = op.inValue("Button Value", 1);

let eventOut = op.addOutPort(new CABLES.Port(op, "Event Output", CABLES.OP_PORT_TYPE_OBJECT));

let lastIndex = op.addOutPort(new CABLES.Port(op, "Last Index"));
let numButtons = op.addOutPort(new CABLES.Port(op, "Num Buttons"));

let values = op.addOutPort(new CABLES.Port(op, "Buttons", CABLES.OP_PORT_TYPE_ARRAY));

let inClear = op.inTriggerButton("Clear");

let inEnabled = op.inValueBool("enabled", true);

values.ignoreValueSerialize = true;

note.set(60);
noteEnd.set(68);
lastIndex.set(false);
note.onChange = initArray;
noteEnd.onChange = initArray;

learn.onTriggered = function () { learning = true; };
learnEnd.onTriggered = function () { learningEnd = true; };

var learning = false;
var learningEnd = false;
let lastValue = -1;
let buttons = [];
let lastEvent = null;

function setButtonState(i, v)
{
    if (toggle.get())
    {
        if (v != 0)
        {
            if (!buttons[i]) buttons[i] = inValue.get();
            else buttons[i] = 0;
        }
    }
    else
    {
        buttons[i] = v;
    }
    lastIndex.set(i);
    values.set(null);
    values.set(buttons);
    // lastIndex.set(i);
    if (lights.get())
    {
        let noteOnMessage = [0x90, note.get() + i, 0];
        if (buttons[i] > 0) noteOnMessage = [0x90, note.get() + i, 120];

        if (lastEvent && lastEvent.output) lastEvent.output.send(noteOnMessage);
    }
}

function initArray()
{
    // if(!noteEnd.get() || !note.get())return;
    let num = noteEnd.get() - note.get();
    if (num < 0) return;
    buttons.length = num;
    numButtons.set(num);
    for (let i = 0; i < num; i++)
    {
        setButtonState(i, 0);
        buttons[i] = 0;
    }

    values.set(buttons);
}

eventIn.onChange = function ()
{
    if (!inEnabled.get()) return;
    let event = eventIn.get();
    if (!event) return;
    if (learning)
    {
        note.set(event.note);
        learning = false;

        if (CABLES.UI)
        {
            op.uiAttr({ "info": "bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    if (learningEnd)
    {
        noteEnd.set(event.note);
        learningEnd = false;

        if (CABLES.UI)
        {
            op.uiAttr({ "info": "bound to note: " + note.get() });
            op.refreshParams();
        }
    }

    for (let i = note.get(); i <= noteEnd.get(); i++)
    {
        if (event.note == i)
        {
            let v = event.velocity;
            setButtonState(i - note.get(), v);
        }
    }
    lastEvent = event;
    eventOut.set(event);
};

inClear.onTriggered = function ()
{
    initArray();
};
