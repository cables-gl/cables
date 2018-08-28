const inObject=op.inObject("Object");
const outObject=op.outObject("Result Object");
const inKey=op.inValueString("Key");
const inValue=op.inObject("Object Value");

inObject.onChange=update;
inKey.onChange=update;
inValue.onChange=update;

function update()
{
    var obj=inObject.get();
    if(!obj)obj={};
    
    if(inKey.get().indexOf(",")>-1)
    {
        const keys=inKey.get().split(',');
        console.log(keys);
        for(var i in keys)
        {
            if(keys[i] && keys[i].length>0)
            {
                obj[keys[i]]=inValue.get();
            }
        }
    }
    else
    {
        obj[inKey.get()]=inValue.get();
    }
    
    outObject.set(null);
    outObject.set(obj);
    
    console.log(obj);
}
