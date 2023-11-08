const
    inArr = op.inArray("Array"),
    inMin = op.inValue("Min", 0),
    inMax = op.inValue("Max", 1),
    outArr = op.outArray("Result Array"),
    anim = new CABLES.Anim();

anim.createPort(op, "Easing", updateAnimEasing);
anim.setValue(0, 0);
anim.setValue(1, 1);
let resultArr = [];
op.onLoaded = inMin.onChange = inMax.onChange = updateMinMax;

inArr.onChange = updateArray;

function updateMinMax()
{
    anim.keys[0].time = anim.keys[0].value = Math.min(inMin.get(), inMax.get());
    anim.keys[1].time = anim.keys[1].value = Math.max(inMin.get(), inMax.get());
}

function updateAnimEasing()
{
    anim.keys[0].setEasing(anim.defaultEasing);
    updateArray();
}

function updateArray()
{
    const arr = inArr.get();
    if (!arr)
    {
        outArr.set(null);
        return;
    }
    resultArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        resultArr[i] = anim.getValue(arr[i]);
    }
    outArr.setRef(resultArr);
}
