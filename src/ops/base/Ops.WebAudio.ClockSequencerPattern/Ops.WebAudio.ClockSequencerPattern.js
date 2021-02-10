const STEPS = Array(32).fill().map((_, i) => 1 + i);

const inTrigger = op.inTrigger("Clock Trigger Input");
const inSequenceArray = op.inArray("Sequence Array");
const inSteps = op.inDropDown("Steps", STEPS, "16");
const inReset = op.inTriggerButton("Reset");

const outTrigger = op.outTrigger("Sequence Trigger Output");
const outValue = op.outNumber("Sequenced Value");
const outTickCount = op.outNumber("Current Step");

let updateParameters = false;
let arrayChanged = false;
let hasArray = false;

let COUNT_MODULO = Number(inSteps.get());
let tickCount = 0;
inSteps.onChange = () =>
{
    if (inTrigger.isLinked())
    {
        updateParameters = true;
        return;
    }
    COUNT_MODULO = Number(inSteps.get());
};

inSequenceArray.onChange = () => arrayChanged = true;
let resetCount = false;
inReset.onTriggered = () => resetCount = true;

inTrigger.onTriggered = () =>
{
    if (updateParameters)
    {
        COUNT_MODULO = Number(inSteps.get());
        updateParameters = false;
    }

    if (resetCount)
    {
        tickCount = 0;
        resetCount = false;
    }
    const arr = inSequenceArray.get();

    if (arrayChanged)
    {
        if (!arr)
        {
            op.setUiError("noArr", "No array connected. Passing through clock.", 1);
            hasArray = false;
        }
        else
        {
            op.setUiError("noArr", null);
            hasArray = true;
        }
        arrayChanged = false;
    }

    if (hasArray)
    {
        if (arr[tickCount])
        {
            outTrigger.trigger();
            outValue.set(arr[tickCount]);
        }
        else
        {
            outValue.set(0);
        }
    }
    else
    {
        outTrigger.trigger();
    }
    outTickCount.set(tickCount);
    tickCount = (tickCount + 1) % COUNT_MODULO;
};
