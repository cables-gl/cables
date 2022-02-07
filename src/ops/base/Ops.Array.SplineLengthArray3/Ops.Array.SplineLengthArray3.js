const
    inArr = op.inArray("Array3x"),
    inCalc = op.inTriggerButton("Calculate"),
    outValue = op.outNumber("Length");

let needsCalc = true;

inArr.onChange = function ()
{
    needsCalc = true;
};

inCalc.onTriggered = function ()
{
    if (needsCalc)
    {
        needsCalc = false;
        let arr = inArr.get();
        if (!arr || arr.length < 3)
        {
            outValue.set(0);
            return;
        }

        let l = 0;
        for (let i = 3; i < arr.length; i += 3)
        {
        	let xd = arr[i - 3] - arr[i + 0];
        	let yd = arr[i - 2] - arr[i + 1];
        	let zd = arr[i - 1] - arr[i + 2];
            l += Math.sqrt(xd * xd + yd * yd + zd * zd);
        }

        if (l != l)l = 0;
        outValue.set(l);
    }
};
