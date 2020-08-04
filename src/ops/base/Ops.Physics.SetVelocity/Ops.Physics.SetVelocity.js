var exec=op.inTrigger("Exec");

var velX=op.inValue("Velocity X");
var velY=op.inValue("Velocity Y");
var velZ=op.inValue("Velocity Z");

var doSet=op.inTriggerButton("Set");

var next=op.outTrigger("Next");

var doSetDelayed=false;

doSet.onTriggered=function()
{
    doSetDelayed=true;
};

exec.onTriggered=function()
{
    if(doSetDelayed && CABLES.physicsCurrentBody)
    {
        CABLES.physicsCurrentBody.velocity.set(velX.get(),velY.get(),velZ.get());
        doSetDelayed=false;
    }
    
    next.trigger();
};