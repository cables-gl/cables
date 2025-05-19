const
    exe = op.inTrigger("Exe"),
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),
    inPerc = op.inValueSlider("perc"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

let needsCalc = true;
let resultArr = [];
op.toWorkPortsNeedToBeLinked(inArr1, inArr2);
inArr1.onChange = inArr2.onChange = inPerc.onChange = calcLater;
exe.onTriggered = execute;

function calcLater()
{
    needsCalc = true;
}

function execute()
{
    let arr1 = inArr1.get();
    let arr2 = inArr2.get();

    let val1;
    let val2;
    let m;

    if (!arr1 || !arr2 || arr1.length < arr2.length)
    {
        outArr.set(null);
        return;
    }

    if (needsCalc)
    {
        if (resultArr.length != arr1.length) resultArr.length = arr1.length;

        let perc = inPerc.get();

        for (let i = 0; i < arr1.length; i++)
        {
            val1 = arr1[i];
            val2 = arr2[i];
            m = (val2 - val1) * perc + val1;
            resultArr[i] = m;
        }
        needsCalc = false;
        outArr.setRef(resultArr);
    }

    next.trigger();
}

// check that array input is string or not
inArr1.onLinkChanged = inArr2.onLinkChanged = function ()
{
    let arr1 = inArr1.get();
    let arr2 = inArr2.get();

    if (!arr1 || !arr2)
    {
        outArr.set(null);
        return;
    }

    let stringTest1 = arr1[0];
    let stringTest2 = arr2[0];

    if (typeof stringTest1 === "string" || typeof stringTest2 === "string")
    {
        outArr.set(null);
    }
};
