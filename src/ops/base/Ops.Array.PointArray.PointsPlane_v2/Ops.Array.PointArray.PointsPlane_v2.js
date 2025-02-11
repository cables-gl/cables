const
    inNumX = op.inValueInt("Rows", 32),
    inNumY = op.inValueInt("Columns", 32),
    inHeight = op.inFloat("Width", 2),
    inWidth = op.inFloat("Height", 2),
    inRowOffset = op.inFloat("Row Offset", 0),
    inCenter = op.inValueBool("Center", true),
    outArr = op.outArray("Result", [], 3),
    outTotalPoints = op.outNumber("Total points"),
    outArrayLength = op.outNumber("Array length"),
    outRowNums = op.outArray("Row Numbers", [], 1),
    outColNums = op.outArray("Column Numbers", [], 1);

inNumX.onChange =
    inNumY.onChange =
    inCenter.onChange =
    inWidth.onChange =
    inRowOffset.onChange =
    inHeight.onChange = generate;

const arr = [];
const arrRowNums = [];
const arrColNums = [];
outArr.setRef(arr);
generate();

function generate()
{
    arr.length = 0;
    const numX = Math.floor(Math.max(0, inNumX.get()));
    const numY = Math.floor(Math.max(0, inNumY.get()));

    if (!CABLES.isNumeric(numX) || !CABLES.isNumeric(numY) || numX < 0 || numY < 0)
    {
        outRowNums.setRef(0);
        outColNums.setRef(0);
        outArr.setRef([]);
        outTotalPoints.set(0);
        outArrayLength.set(0);
        return;
    }

    let stepX = 0;
    let stepY = 0;

    // to avoid divide by zero
    if (numX == 1)
    {
        stepX = inWidth.get() / (numX);
    }
    else
    {
        stepX = inWidth.get() / (numX - 1);
    }
    if (numY == 1)
    {
        stepY = inHeight.get() / (numY);
    }
    else
    {
        stepY = inHeight.get() / (numY - 1);
    }

    let i = 0;

    let centerX = 0;
    let centerY = 0;

    if (inCenter.get())
    {
        centerX = inWidth.get() / 2;
        centerY = inHeight.get() / 2;
    }

    const l = Math.floor(numX) * Math.floor(numY) * 3;

    arr.length = l;
    arrColNums.length = l / 3;
    arrRowNums.length = l / 3;

    let offRow = inRowOffset.get();
    let off = 0;
    for (let y = 0; y < numY; y++)
    {
        for (let x = 0; x < numX; x++)
        {
            off = 0;
            if (x % 2 == 0 && offRow)off = offRow;

            arrColNums[i / 3] = y;
            arrRowNums[i / 3] = x;

            arr[i++] = stepY * y - centerY + off;
            arr[i++] = stepX * x - centerX;

            arr[i++] = 0;
        }
    }

    outRowNums.setRef(arrRowNums);
    outColNums.setRef(arrColNums);
    outArr.setRef(arr);
    outTotalPoints.set(arr.length / 3);
    outArrayLength.set(arr.length);
}
