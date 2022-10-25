let inArr = op.inArray("Points");
let subDivs = op.inInt("Num Subdivs", 5);
let bezier = op.inValueBool("Smooth", true);
let bezierEndPoints = op.inValueBool("Bezier Start/End Points", true);

let result = op.outArray("Result");

op.toWorkPortsNeedToBeLinked(inArr);

subDivs.onChange = calc;
bezier.onChange = calc;
inArr.onChange = calc;
bezierEndPoints.onChange = calc;

function ip(x0, x1, x2, t)// Bezier
{
    let r = (x0 * (1 - t) * (1 - t) + 2 * x1 * (1 - t) * t + x2 * t * t);
    return r;
}

let arr = [];

function calc()
{
    if (!inArr.get())
    {
        result.set(null);
        return;
    }
    const subd = Math.floor(subDivs.get());
    let inPoints = inArr.get();

    if (inPoints.length < 3) return;

    let i = 0;
    let j = 0;
    let k = 0;
    let count = 0;

    if (subd > 0 && !bezier.get())
    {
        const newLen = (inPoints.length - 1) * subd;
        if (newLen != arr.length)
        {
            arr.length = newLen;
        }

        count = 0;
        for (i = 0; i < inPoints.length - 1; i++)
        {
            for (j = 0; j < subd; j++)
            {
                arr[count] =
                        inPoints[i] + (inPoints[i + 1] - inPoints[i]) * j / subd;
                count++;
            }
        }
    }
    else
    if (subd > 0 && bezier.get())
    {
        let newLen = (inPoints.length - 6) * (subd - 1);
        if (bezierEndPoints.get())newLen += 6;

        if (newLen != arr.length) arr.length = Math.floor(Math.abs(newLen));
        count = 0;

        if (bezierEndPoints.get())
        {
            arr[0] = inPoints[0];
            count = 1;
        }

        for (i = 1; i < inPoints.length - 1; i++)
        {
            for (j = 0; j < subd; j++)
            {
                let p = ip(
                    (inPoints[i - 1] + inPoints[i]) / 2,
                    inPoints[i + 0],
                    (inPoints[i + 1] + inPoints[i]) / 2,
                    j / subd
                );
                arr[count] = p;
                count++;
            }
        }

        if (bezierEndPoints.get())
        {
            arr[count] = inPoints[inPoints.length - 1];
        }
    }
    result.set(null);
    result.set(arr);
}
