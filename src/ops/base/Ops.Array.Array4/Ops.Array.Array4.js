const
    inNum = op.inValueInt("Num Quadruplets", 100),
    inX = op.inValueFloat("X", 1),
    inY = op.inValueFloat("Y", 1),
    inZ = op.inValueFloat("Z", 1),
    inW = op.inValueFloat("W", 1),
    outArr = op.outArray("Array", null, 4),
    outTotalPoints = op.outNumber("Total Quadruplets"),
    outArrayLength = op.outNumber("Array length");

inNum.onChange =
    inX.onChange =
    inY.onChange =
    inZ.onChange =
    inW.onChange = update;

let arr = [];
update();

function update()
{
    let num = Math.floor(inNum.get() * 4);

    if (num < 0)num = 0;
    if (arr.length != num) arr.length = num;

    const x = inX.get();
    const y = inY.get();
    const z = inZ.get();
    const w = inW.get();

    for (let i = 0; i < num; i += 4)
    {
        arr[i] = x;
        arr[i + 1] = y;
        arr[i + 2] = z;
        arr[i + 3] = w;
    }

    outArr.setRef(arr);
    outTotalPoints.set(num / 4);
    outArrayLength.set(num);
}
