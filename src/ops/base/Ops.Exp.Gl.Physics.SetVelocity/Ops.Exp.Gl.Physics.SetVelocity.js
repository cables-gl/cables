op.name="SetVelocity";

var exec=op.inFunction("Exec");


var velX=op.inValue("Velocity X");
var velY=op.inValue("Velocity Y");
var velZ=op.inValue("Velocity Z");


var next=op.outFunction("Next");


exec.onTriggered=function()
{
    if(CABLES.physicsCurrentBody)
    {
        CABLES.physicsCurrentBody.velocity.set(velX.get(),velY.get(),velZ.get());

        
    }

    
    next.trigger();
};