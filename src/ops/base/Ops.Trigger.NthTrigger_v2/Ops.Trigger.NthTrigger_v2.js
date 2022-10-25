let DEFAULT_NTH = 5;

// inputs
let exePort = op.inTriggerButton("Execute");
let nthPort = op.inValue("Nth", DEFAULT_NTH);

// outputs
let triggerPort = op.outTrigger("Next");

let count = 0;
let nth = DEFAULT_NTH;

exePort.onTriggered = onExeTriggered;
nthPort.onChange = valueChanged;

function onExeTriggered()
{
    count++;
    if (count % nth === 0)
    {
        count = 0;
        triggerPort.trigger();
    }
}

function valueChanged()
{
    nth = nthPort.get();
    count = 0;
}
