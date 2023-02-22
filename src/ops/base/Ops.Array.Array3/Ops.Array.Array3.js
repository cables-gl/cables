const
    inNum = op.inValueInt("Num Triplets", 100),
    inX = op.inValueFloat("X", 0),
    inY = op.inValueFloat("Y", 0),
    inZ = op.inValueFloat("Z", 0),
    outArr = op.outArray("Array", null, 3),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length");

inNum.onChange =
    inX.onChange =
    inY.onChange =
    inZ.onChange = update;

let arr = [];
update();

function update()
{
    let num = Math.floor(inNum.get() * 3);

    if (num < 0)num = 0;
    if (arr.length != num) arr.length = num;

    const x = inX.get();
    const y = inY.get();
    const z = inZ.get();

    for (let i = 0; i < num; i += 3)
    {
        arr[i] = x;
        arr[i + 1] = y;
        arr[i + 2] = z;
    }

    outArr.setRef(arr);
    outTotalPoints.set(num / 3);
    outArrayLength.set(num);
}
