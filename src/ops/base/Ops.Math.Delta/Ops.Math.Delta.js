const
    val = op.inValue("Value"),
    changeAlwaysPort = op.inValueBool("Change Always", false),
    inReset = op.inTrigger("Reset"),
    result = op.outNumber("Delta");

val.changeAlways = false;

let oldVal = 0;
let firstTime = true;

changeAlwaysPort.onChange = function ()
{
    val.changeAlways = changeAlwaysPort.get();
};

inReset.onTriggered = function ()
{
    firstTime = true;
};

val.onChange = function ()
{
    let change = oldVal - val.get();
    oldVal = val.get();
    if (firstTime)
    {
        firstTime = false;
        return;
    }
    result.set(change);
};
