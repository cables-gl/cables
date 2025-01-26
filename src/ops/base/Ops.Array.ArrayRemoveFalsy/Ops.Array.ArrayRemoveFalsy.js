const
    inArr = op.inArray("Array"),
    rmFalsy = op.inBool("Remove Falsy", true),
    outArr = op.outArray("Result Array");

rmFalsy.onChange =
inArr.onChange = () =>
{
    let r = [];
    let arr = inArr.get() || [];

    for (let i = 0; i < arr.length; i++)
    {
        if (!rmFalsy.get() || arr[i])
            r.push(arr[i]);
    }

    outArr.setRef(r);
};
