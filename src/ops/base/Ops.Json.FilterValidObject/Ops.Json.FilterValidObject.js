const
    inObj=op.inObject("Object"),
    outObject=op.outObject("Last Valid Object"),
    outValid=op.outBool("Is Valid");

inObj.onChange=
    update;


function update()
{
    const obj=inObj.get();

    var r=true;

    if(!obj) r=false;

    if(r) outObject.set(obj);

    outValid.set(r);
}