op.name="SetVelocity";

var exec=op.inFunction("Exec");


var velX=op.inValue("Velocity X");
var velY=op.inValue("Velocity Y");
var velZ=op.inValue("Velocity Z");

var doSet=op.inFunctionButton("Set");

var next=op.outFunction("Next");

doSetDelayed=false;

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