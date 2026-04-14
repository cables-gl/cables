const
    inArr = op.inArray("Array"),
    result = op.outNumber("Sum");

inArr.onChange = function ()
{
    if (inArr.get())
    {
        let arr = inArr.get();
        let sum = 0;
        for (let i = 0; i < arr.length; i++)
        {
            sum += Number(arr[i]);
        }
        result.set(sum);
    }
    else
    {
        result.set(0);
    }
};
