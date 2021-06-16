const inObject=op.inObject("Object");
const inKey=op.inString("Key");
const inValue=op.inObject("Object Value");
const inUpdate=op.inTriggerButton("Set Object");
const outObject=op.outObject("Result Object");

// inObject.onChange=update;
// inKey.onChange=update;
inUpdate.onTriggered=update;

function update()
{
    var obj=inObject.get();
    if(!obj)
    {
        obj={};
    }
    else
    {
        var changed=false;

        if(inKey.get().indexOf(",")>-1)
        {
            const keys=inKey.get().split(',');

            for(var i in keys)
            {
                if(keys[i] && keys[i].length>0)
                {
                    if(obj[keys[i]]!=inValue.get())changed=true;
                    obj[keys[i]]=inValue.get();
                }
            }
        }
        else
        {
            if(obj[inKey.get()]!=inValue.get())changed=true;
            obj[inKey.get()]=inValue.get();
        }

        outObject.set(null);
    }

    outObject.set(obj);
}
