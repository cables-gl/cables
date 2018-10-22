
var inObj=op.inObject("Object");

var next=op.outFunction("Next");

var obj=null;

inObj.onChange=function()
{
    if(inObj.get()!=obj)
    {
        obj=inObj.get();
        next.trigger();
    }
};