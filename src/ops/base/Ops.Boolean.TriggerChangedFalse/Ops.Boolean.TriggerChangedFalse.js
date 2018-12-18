
var val=op.inValueBool("Value",false);

var next=op.outTrigger("Next");

var oldVal=0;

val.onChange=function()
{
    var newVal=val.get();
    if(oldVal && !newVal)
    {
        oldVal=false;
        next.trigger();
    }
    else
    {
        oldVal=true;
    }
};