const inObject = op.inObject("Object");
const inKey = op.inString("Key");
const inValue = op.inObject("Object Value");
const outObject = op.outObject("Result Object");

op.onDelete = removeKey;

inObject.onLinkChanged =
inValue.onChange =

outObject.onLinkChanged =
inObject.onChange = update;

let currentKey = "";

let obj = {};

function removeKey()
{
    delete obj[currentKey];
}

function update()
{
    obj = inObject.get() || {};

    let changed = false;

    currentKey = inKey.get();
    if (obj[inKey.get()] != inValue.get())changed = true;
    obj[inKey.get()] = inValue.get();

    outObject.setRef(obj);
}

let oldKey = "";

inKey.onChange = () =>
{
    if (!inKey.isLinked())
    {
        let obj = inObject.get();

        if (obj) delete obj[oldKey];
        op.setUiAttrib({ "extendTitle": inKey.get() });
    }
    oldKey = inKey.get();
    update();
};
