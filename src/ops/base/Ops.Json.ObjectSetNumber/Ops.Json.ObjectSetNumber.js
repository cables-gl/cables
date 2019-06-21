const
    inObject=op.inObject("Object"),
    outObject=op.outObject("Result Object"),
    inKey=op.inString("Key"),
    inValue=op.inValueFloat("Number");

inObject.onChange=
    inKey.onChange=
    inValue.onChange=update;

function update()
{
    var obj=inObject.get();
    if(!obj)obj={};

    obj[inKey.get()]=inValue.get();

    outObject.set(null);
    outObject.set(obj);
}
