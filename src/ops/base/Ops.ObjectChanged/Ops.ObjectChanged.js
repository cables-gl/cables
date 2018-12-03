
var inObj=op.inObject("Object");

var next=op.outTrigger("Next");

var obj=null;

inObj.onChange=function()
{
    if(inObj.get()!=obj)
    {
        obj=inObj.get();
        next.trigger();
    }
};