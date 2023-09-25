const
    inArr = op.inArray("Array"),
    inArrayStide = op.inSwitch("Stride", ["X", "XY", "XYZ", "XYZW"], "XYZ"),
    inEle = op.inSwitch("Compare Element", ["X", "Y", "Z", "W"], "Z"),
    inMeth = op.inSwitch("Filter Method", [">", "<"], "<"),
    inFilterNum = op.inFloat("Compare to", 0.5),
    outArr = op.outArray("Result");

let compEl = 2;
let stride = 3;

inEle.onChange = () =>
{
    if (inEle.get() == "X")compEl = 0;
    else if (inEle.get() == "Y")compEl = 1;
    else if (inEle.get() == "Z")compEl = 2;
    else if (inEle.get() == "W")compEl = 3;

    update();
};

inArrayStide.onChange = () =>
{
    if (inArrayStide.get() == "X")stride = 1;
    else if (inArrayStide.get() == "XY")stride = 2;
    else if (inArrayStide.get() == "XYZ")stride = 3;
    else if (inArrayStide.get() == "XYZW")stride = 4;

    update();
};

inMeth.onChange =
inFilterNum.onChange =
inArr.onChange = update;

function update()
{
    const arr = inArr.get();
    const newArr = [];
    if (!arr) return;

    if (inMeth.get() == "<")
    {
        for (let i = 0; i < arr.length; i += stride)
            if (arr[i + compEl] < inFilterNum.get()) // comparison
                for (let j = 0; j < stride; j++)
                    newArr.push(arr[i + j]);
    }
    else if (inMeth.get() == ">")
    {
        for (let i = 0; i < arr.length; i += stride)
            if (arr[i + compEl] > inFilterNum.get()) // comparison
                for (let j = 0; j < stride; j++)
                    newArr.push(arr[i + j]);
    }

    outArr.setRef(newArr);
}
