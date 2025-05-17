const
    inArr = op.inArray("Array1x"),
    format = op.inSwitch("Format", ["AB", "ABC", "ABCD"], "ABC"),
    axisA = op.inSwitch("A", ["Input", "index", "0-1", "-1-1", "0", "1"], "Input"),
    axisB = op.inSwitch("B", ["Input", "index", "0-1", "-1-1", "0", "1"], "0-1"),
    axisC = op.inSwitch("C", ["Input", "index", "0-1", "-1-1", "0", "1"], "0"),
    axisD = op.inSwitch("D", ["Input", "index", "0-1", "-1-1", "0", "1"], "0"),
    outArr = op.outArray("Array3x"),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

const arr = [];

axisA.onChange =
axisB.onChange =
axisC.onChange =
axisD.onChange =
inArr.onChange = update;

format.onChange = function ()
{
    axisC.setUiAttribs({ "greyout": format.get().length < 3 });
    axisD.setUiAttribs({ "greyout": format.get().length < 4 });

    update();
};

function fillArr_0(off, num, stride)
{
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = 0;
    }
}

function fillArr_1(off, num, stride)
{
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = 1;
    }
}

function fillArr_input(off, num, stride)
{
    const theArray = inArr.get();
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = theArray[i / stride];
    }
}

function fillArr_01(off, num, stride)
{
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = (i / (num)) * 2 - 1 || 0;
    }
}

function fillArr_m1(off, num, stride)
{
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = (i / (num)) || 0;
    }
}

function fillArr_index(off, num, stride)
{
    for (let i = 0; i < num; i += stride)
    {
        arr[i + off] = i / stride;
    }
}

function fillArr(off, meth, stride)
{
    if (meth == "0")fillArr_0(off, arr.length, stride);
    if (meth == "0-1")fillArr_01(off, arr.length, stride);
    if (meth == "1")fillArr_1(off, arr.length, stride);
    if (meth == "-1-1")fillArr_m1(off, arr.length, stride);
    if (meth == "Input")fillArr_input(off, arr.length, stride);
    if (meth == "index")fillArr_index(off, arr.length, stride);
}

function update()
{
    const theArray = inArr.get();
    if (!theArray)
    {
        outArr.set(null);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }

    const stride = format.get().length;
    const l = theArray.length * stride;
    arr.length = l;

    if (stride >= 2) fillArr(0, axisA.get(), stride);
    if (stride >= 2) fillArr(1, axisB.get(), stride);
    if (stride >= 3) fillArr(2, axisC.get(), stride);
    if (stride >= 4) fillArr(3, axisD.get(), stride);

    // for(var i=0;i<theArray.length;i++)
    // {
    //     arr[i*3+0]=i;
    //     arr[i*3+1]=theArray[i];
    //     arr[i*3+2]=0;
    // }

    outArr.setRef(arr);
    outTotalPoints.set(arr.length / stride);
    outArrayLength.set(arr.length);
}
