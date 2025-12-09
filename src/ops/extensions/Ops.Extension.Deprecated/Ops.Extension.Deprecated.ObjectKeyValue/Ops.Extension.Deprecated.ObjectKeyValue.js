let inObject = op.inObject("Object");
let outObject = op.outObject("Result Object");

let inKey = op.inValueString("Key");
let inValue = op.inValueString("Value");

inObject.onChange = update;
inKey.onChange = update;
inValue.onChange = update;

function update()
{
    let obj = inObject.get();
    if (!obj)obj = {};

    obj[inKey.get()] = inValue.get();

    outObject.set(null);
    outObject.set(obj);
}
