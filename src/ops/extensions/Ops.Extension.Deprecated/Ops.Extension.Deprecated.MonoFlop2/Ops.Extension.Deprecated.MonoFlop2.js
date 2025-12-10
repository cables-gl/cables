let update = op.inTriggerButton("update");
// var trigger=op.inTriggerButton("Trigger");
let duration = op.inValue("Duration", 1);
let valueTrue = op.inValue("Value True", 1);
let valueFalse = op.inValue("Value False", 0);

let result = op.outValue("Result", false);

let nextTime = -1;

valueTrue.onChange = function ()
{
    result.set(valueTrue.get());
    nextTime = CABLES.now() + duration.get() * 1000;
};

update.onTriggered = doUpdate;

function doUpdate()
{
    if (CABLES.now() > nextTime)
    {
        result.set(valueFalse.get());
    }
}
