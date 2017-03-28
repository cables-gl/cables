op.name="ObjectIterate";

var inObj=op.inObject("Object");

var outKey=op.outValue("Key");


inObj.onChange=function()
{
    var obj=inObj.get();
    
    if(obj)
    {
        for(var i in obj)
        {
            outKey.set(i);
        }
    }
    
}