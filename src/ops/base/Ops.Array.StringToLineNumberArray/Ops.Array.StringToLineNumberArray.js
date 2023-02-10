const
    inStr = op.inStringEditor("String"),
    outArr = op.outArray("Result");

// outIdx=op.outNumber("Line"),
// outFound=op.outBoolNum("Found");

inStr.onChange = () =>
{
    let str = inStr.get() || "";
    // let idx=inIdx.get()||0;
    let line = 0;

    // if(idx<0)idx=0;

    // let off=0;
    // let found=false;

    let arr = [];

    for (let i = 0; i < str.length; i++)
    {
        if (str.charAt(i) == "\n")
        {
            line++;
            continue;
        }
        arr.push(line);
    }

    outArr.setRef(arr);
};
