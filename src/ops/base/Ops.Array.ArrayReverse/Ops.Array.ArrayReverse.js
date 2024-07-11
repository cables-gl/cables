const
    inArr = op.inArray("Input"),
    inActive = op.inBool("Active", true),
    outArr = op.outArray("Result");

inActive.onChange =
inArr.onChange = function ()
{
    let arr = inArr.get();
    if (arr)
    {
        let arrCopy = arr.slice();
        if (inActive.get())arrCopy = arrCopy.reverse();
        outArr.setRef(arrCopy);
    }
};
