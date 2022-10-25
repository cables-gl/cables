let N_PORTS = 8;

// input ports
const
    inTrigger1 = op.inTriggerButton("Trigger 1"),
    inArray1 = op.inArray("Array 1"),
    inTrigger2 = op.inTriggerButton("Trigger 2"),
    inArray2 = op.inArray("Array 2"),
    inTrigger3 = op.inTriggerButton("Trigger 3"),
    inArray3 = op.inArray("Array 3"),
    inTrigger4 = op.inTriggerButton("Trigger 4"),
    inArray4 = op.inArray("Array 4"),
    inTrigger5 = op.inTriggerButton("Trigger 5"),
    inArray5 = op.inArray("Array 5"),
    inTrigger6 = op.inTriggerButton("Trigger 6"),
    inArray6 = op.inArray("Array 6"),
    inTrigger7 = op.inTriggerButton("Trigger 7"),
    inArray7 = op.inArray("Array 7"),
    inTrigger8 = op.inTriggerButton("Trigger 8"),
    inArray8 = op.inArray("Array 8");

// output ports
let outArray = op.outArray("Out Array");

// change listeners
inTrigger1.onTriggered = function ()
{
    outArray.set(inArray1.get());
};
inTrigger2.onTriggered = function ()
{
    outArray.set(inArray2.get());
};
inTrigger3.onTriggered = function ()
{
    outArray.set(inArray3.get());
};
inTrigger4.onTriggered = function ()
{
    outArray.set(inArray4.get());
};
inTrigger5.onTriggered = function ()
{
    outArray.set(inArray5.get());
};
inTrigger6.onTriggered = function ()
{
    outArray.set(inArray6.get());
};
inTrigger7.onTriggered = function ()
{
    outArray.set(inArray7.get());
};
inTrigger8.onTriggered = function ()
{
    outArray.set(inArray8.get());
};
