const increment = op.inTriggerButton("Increment");
const decrement = op.inTriggerButton("Decrement");
const inLength = op.inValueInt("Length");
const reset = op.inTriggerButton("Reset");
const inMode = op.inValueSelect("Mode", ["Rewind", "Stop at Max"]);
const outChanged = op.outTrigger("Changed");
const value = op.outValue("Value");

const outRestarted = op.outTrigger("Restarted");


value.ignoreValueSerialize = true;
inLength.set(10);
let val = 0;
value.set(0);

inLength.onTriggered = reset;
reset.onTriggered = doReset;

const MODE_REWIND = 0;
const MODE_STOP = 1;

let mode = MODE_REWIND;

inMode.onChange = function ()
{
    if (inMode.get() == "Rewind")
    {
        mode = MODE_REWIND;
    }
    if (inMode.get() == "Stop at Max")
    {
        mode = MODE_STOP;
    }
};

function doReset()
{
    value.set(null);
    val = 0;
    value.set(val);
    outRestarted.trigger();
}

decrement.onTriggered = function ()
{
    val--;
    if (mode == MODE_REWIND && val < 0)val = inLength.get() - 1;
    if (mode == MODE_STOP && val < 0)val = 0;

    value.set(val);

    outChanged.trigger();
};

increment.onTriggered = function ()
{
    val++;
    if (mode == MODE_REWIND && val >= inLength.get())
    {
        val = 0;
        outRestarted.trigger();
    }
    if (mode == MODE_STOP && val >= inLength.get())val = inLength.get() - 1;

    value.set(val);

    outChanged.trigger();
};
