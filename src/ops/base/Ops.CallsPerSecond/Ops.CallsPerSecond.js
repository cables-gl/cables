op.name='CallsPerSecond';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var cps=op.addOutPort(new Port(op,"cps",OP_PORT_TYPE_VALUE));

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