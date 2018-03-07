
var inObj=op.inObject("Object");

var outNumKeys=op.outValue("Num Keys");
var outKeys=op.outArray("Keys");

inObj.onChange=function()
{
    var o=inObj.get();
    if(!o)
    {
        outNumKeys.set(0);
        outKeys.set([]);
        return;
    }
    
    
    var keys=Object.keys(o);
    outNumKeys.set(keys.length);
    outKeys.set(keys);

    

    // result.set(outObject.set(inObject.get()));
};
