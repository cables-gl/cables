const CHANGE_ALWAYS_DEFUALT = false;

const
    val=op.inValue("Value"),
    changeAlwaysPort = op.inValueBool('Change Always', CHANGE_ALWAYS_DEFUALT),
    inReset=op.inTrigger("Reset"),
    result=op.outValue("Delta");

val.changeAlways = CHANGE_ALWAYS_DEFUALT;

var oldVal=0;

var firstTime=true;

changeAlwaysPort.onChange = function()
{
    val.changeAlways = changeAlwaysPort.get();
};

inReset.onTriggered=function()
{
    firstTime=true;
};

val.onChange=function()
{
    var change=oldVal-val.get();
    oldVal=val.get();
    if(firstTime)
    {
        firstTime=false;
        return;
    }
    result.set(change);
};

