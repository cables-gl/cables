const
    inObj = op.inObject("Object"),
    outObject = op.outObject("Last Valid Object"),
    outValid = op.outBool("Is Valid");

inObj.onChange =
    update;

function update()
{
    const obj = inObj.get();

    let r = true;

    if (!obj) r = false;

    if (r) outObject.setRef(obj);

    outValid.set(r);
}
