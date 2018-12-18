const
    exe=op.inTrigger("exe"),
    cps=op.outValue("cps");

var timeStart=0;
var cpsCount=0;

exe.onTriggered=function()
{
    if(timeStart===0)timeStart=CABLES.now();
    var now = CABLES.now();

    if(now-timeStart>1000)
    {
        timeStart=CABLES.now();
        cps.set(cpsCount);
        cpsCount=0;
    }

    cpsCount++;
};