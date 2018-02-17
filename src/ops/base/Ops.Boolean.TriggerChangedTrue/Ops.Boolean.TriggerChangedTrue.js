
var val=op.inValueBool("Value",false);

var next=op.outFunction("Next");

var oldVal=0;

val.onChange=function()
{
    var newVal=val.get();
    if(!oldVal && newVal)
    {
        oldVal=true;
        next.trigger();
    }
    else
    {
        oldVal=false;
    }
};