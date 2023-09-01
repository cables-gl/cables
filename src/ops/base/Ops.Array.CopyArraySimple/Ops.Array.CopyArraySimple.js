const
    inArr = op.inArray("Input"),
    outArr = op.outArray("Result", []);

inArr.onChange = function ()
{
    let arr = inArr.get();
    if (arr)
    {
        let arrCopy = arr.slice();
        outArr.setRef(arrCopy);
    }
};
