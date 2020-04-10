const
    exec=op.inTrigger("Trigger"),
    result=op.outBool("Was Triggered",false);

var frameCount=0;

op.onAnimFrame=function(tt)
{
    frameCount++;
    if(frameCount>1) result.set(false);
};

exec.onTriggered=function()
{
    frameCount=0;
    result.set(true);
};
