const inObject = op.inObject("Object");
const inKey = op.inString("Key");
const inValue = op.inObject("Object Value");
const inUpdate = op.inTriggerButton("Set Object");
const outObject = op.outObject("Result Object");

// inObject.onChange=update;
// inKey.onChange=update;
inUpdate.onTriggered = update;

let obj = null;

op.onDelete =
inObject.onChange = () =>
{
    if (obj)
        delete obj[inKey.get()];
};

function update()
{
    obj = inObject.get();
    if (!obj)
    {
        obj = {};
    }
    else
    {
        let changed = false;

        if (inKey.get().indexOf(",") > -1)
        {
            const keys = inKey.get().split(",");

            for (let i in keys)
            {
                if (keys[i] && keys[i].length > 0)
                {
                    if (obj[keys[i]] != inValue.get())changed = true;
                    obj[keys[i]] = inValue.get();
                }
            }
        }
        else
        {
            if (obj[inKey.get()] != inValue.get())changed = true;
            obj[inKey.get()] = inValue.get();
        }

        // outObject.set(null);
    }

    outObject.setRef(obj);
}
