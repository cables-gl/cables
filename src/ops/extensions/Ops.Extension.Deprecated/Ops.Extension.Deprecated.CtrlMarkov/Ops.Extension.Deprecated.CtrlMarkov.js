let chain = null;
let firstRound = true;

// inputs
let valuesPort = op.inObject("Values");
let startPort = op.inValueString("Start Value");
let nextPort = op.inTriggerButton("Next");

// outputs
let outValuePort = op.outValueString("Next Value");

valuesPort.onChange = function ()
{
    if (valuesPort.get())
    {
        chain = new Tone.CtrlMarkov(valuesPort.get());
    }
    else
    {
        chain = null;
    }
};

nextPort.onTriggered = function ()
{
    if (!chain) { return; } // TODO: Show UI error
    let outValue = "";
    if (firstRound)
    {
        let startValue = startPort.get();
        if (typeof startValue !== "undefined" && valuesPort.get().hasOwnProperty(startValue))
        {
            chain.value = startValue; // if start value is defined an valid, use it
        }
        firstRound = false;
    }
    outValuePort.set(chain.next());
};

// clean up
op.onDelete = function ()
{
    if (chain)
    {
        chain.dispose();
    }
};
