var inExe=op.inTrigger("Update");
var inVal=op.inValue("Value");
var result=op.outValue("Speed");

inVal.alwaysChange=true;

var lastVal=0;
var lastTime=CABLES.now();
inExe.onTriggered=update;

function update()
{
    var diff=Math.abs(inVal.get()-lastVal);
    var diffTime=CABLES.now()-lastTime;
    
    var speed=diff*(1000/diffTime);
    
    result.set(speed);
    
    lastVal=inVal.get();
    lastTime=CABLES.now();
}

