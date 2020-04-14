var inObject=op.inObject("Object");
var outObject=op.outObject("Result Object");

var inKey=op.inString("Key");
var inValue=op.inString("Value");

inObject.onChange=update;
inKey.onChange=update;
inValue.onChange=update;

function update()
{
    var obj=inObject.get();
    if(!obj)obj={};

    obj[inKey.get()]=inValue.get();

    outObject.set(null);
    outObject.set(obj);
}
