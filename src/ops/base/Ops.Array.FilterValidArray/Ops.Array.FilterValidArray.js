const
    inArr = op.inArray("Array"),
    inLength = op.inBool("Invalid when length is 0", true),

    outArray = op.outArray("Last Valid Array"),
    outValid = op.outBoolNum("Is Valid");

inLength.onChange =
inArr.onChange =
    update;

function update()
{
    const arr = inArr.get();

    let r = true;

    if (!arr || !arr.length) r = false;
    else if (inLength.get() && arr.length == 0) r = false;

    if (r) outArray.setRef(arr);

    outValid.set(r);
}
