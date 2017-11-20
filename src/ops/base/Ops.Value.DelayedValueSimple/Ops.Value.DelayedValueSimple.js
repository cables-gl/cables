op.name="DelayedValueSimple";

var val=op.inValue("Value");
var de=op.inValue("Delay",1);

var outVal=op.outValue("Out Value");

var timeout=-1;

val.onChange=function()
{
    clearTimeout(timeout);
    var v=val.get();
    timeout=setTimeout(function()
    {
        outVal.set(v);        
    },de.get()*1000);
    
};
