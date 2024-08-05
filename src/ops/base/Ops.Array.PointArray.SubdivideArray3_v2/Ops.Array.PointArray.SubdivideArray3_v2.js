const
    inArr = op.inArray("Points"),
    subDivs = op.inInt("Num Subdivs", 5),
    bezier = op.inValueBool("Smooth", true),
    inLoop = op.inValueBool("Loop", false),
    bezierEndPoints = op.inValueBool("Bezier Start/End Points", true),
    result = op.outArray("Result");

op.toWorkPortsNeedToBeLinked(inArr);

let arr = [];

subDivs.onChange =
    inLoop.onChange =
    bezier.onChange =
    inArr.onChange =
    bezierEndPoints.onChange = calc;

inArr.onLinkChanged = () =>
{
    inArr.copyLinkedUiAttrib("stride", result);
};

function ip(x0, x1, x2, t)// Bezier
{
    const r = (x0 * (1 - t) * (1 - t) + 2 * x1 * (1 - t) * t + x2 * t * t);
    return r;
}

function calc()
{
    inLoop.setUiAttribs({ "greyout": !bezier.get() });
    bezierEndPoints.setUiAttribs({ "greyout": !bezier.get() });

    if (!inArr.get())
    {
        result.set(null);
        return;
    }
    const subd = Math.floor(subDivs.get());
    const inPoints = inArr.get();

    if (inPoints.length < 3) return;

    let i = 0;
    let j = 0;
    let k = 0;
    let count = 0;

    if (subd > 0 && !bezier.get())
    {
        const newLen = (inPoints.length - 3) * subd + 3;
        if (newLen != arr.length)
        {
            arr.length = newLen;
        }

        count = 0;
        for (i = 0; i < inPoints.length - 3; i += 3)
        {
            for (j = 0; j < subd; j++)
            {
                for (k = 0; k < 3; k++)
                {
                    arr[count] =
                        inPoints[i + k] + (inPoints[i + k + 3] - inPoints[i + k]) * j / subd;
                    count++;
                }
            }
        }
        arr[newLen - 3] = inPoints[inPoints.length - 3];
        arr[newLen - 2] = inPoints[inPoints.length - 2];
        arr[newLen - 1] = inPoints[inPoints.length - 1];
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
            arr[1] = inPoints[1];
            arr[2] = inPoints[2];
            count = 3;
        }

        const doLoop = inLoop.get();

        function idx(i)
        {
            if (doLoop) return i % (inPoints.length - 3);
            else return i;
        }

        let endi = inPoints.length - 3;
        if (doLoop)endi = inPoints.length;

        for (i = 3; i < endi; i += 3)
        {
            for (j = 0; j < subd; j++)
            {
                for (k = 0; k < 3; k++)
                {
                    const p = ip(
                        (inPoints[idx(i + k - 3)] + inPoints[idx(i + k)]) / 2,
                        inPoints[idx(i + k + 0)],
                        (inPoints[idx(i + k + 3)] + inPoints[idx(i + k + 0)]) / 2,
                        j / subd
                    );
                    arr[count] = p;
                    count++;
                }
            }
        }

        if (doLoop)
        {
            arr[count + 0] = arr[0];
            arr[count + 1] = arr[1];
            arr[count + 2] = arr[2];
            count++; count++; count++;
        }

        if (bezierEndPoints.get())
        {
            arr[count - 0] = inPoints[inPoints.length - 3];
            arr[count + 1] = inPoints[inPoints.length - 2];
            arr[count + 2] = inPoints[inPoints.length - 1];
        }
    }
    if (subd == 0)
    {
        arr = Array.from(inPoints);
    }

    // result.set(null);
    result.setRef(arr);
}
