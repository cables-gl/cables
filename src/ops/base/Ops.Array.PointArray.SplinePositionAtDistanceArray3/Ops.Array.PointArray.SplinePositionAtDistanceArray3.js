const
    inExec = op.inTriggerButton("Calculate"),
    inArr = op.inArray("Array3x"),
    inDist = op.inValue("Distance"),
    inNormalized = op.inValueBool("Normalized"),

    outNext = op.outTrigger("Next"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),

    outSplineLength = op.outNumber("Spline Length");

let animX = new CABLES.Anim();
let animY = new CABLES.Anim();
let animZ = new CABLES.Anim();

let needsMapping = true;

function dist(x1, y1, z1, x2, y2, z2)
{
    let xd = x1 - x2;
    let yd = y1 - y2;
    let zd = z1 - z2;
    return Math.sqrt(xd * xd + yd * yd + zd * zd);
}

function splineLength(arr)
{
    let l = 0;
    for (let i = 3; i < arr.length; i += 3)
    {
        l += dist(arr[i - 3], arr[i - 2], arr[i - 1], arr[i + 0], arr[i + 1], arr[i + 2]);
    }

    outSplineLength.set(l);
    return l;
}

function mapArrays()
{
    animX.clear();
    animY.clear();
    animZ.clear();
    let arr = inArr.get();
    if (!arr) return;
    let sl = splineLength(arr);

    let distPos = 0;

    for (let i = 0; i < arr.length; i += 3)
    {
        let p = i / (arr.length - 3);
        if (i > 0)
        {
            distPos += dist(arr[i - 3], arr[i - 2], arr[i - 1], arr[i + 0], arr[i + 1], arr[i + 2]);
        }

        animX.setValue(distPos, arr[i + 0]);
        animY.setValue(distPos, arr[i + 1]);
        animZ.setValue(distPos, arr[i + 2]);
    }

    needsMapping = false;
}

inArr.onChange = function ()
{
    needsMapping = true;
};

inExec.onTriggered = function ()
{
    if (needsMapping)mapArrays();

    let d = inDist.get();
    if (inNormalized.get())d *= outSplineLength.get();

    outX.set(animX.getValue(d));
    outY.set(animY.getValue(d));
    outZ.set(animZ.getValue(d));

    outNext.trigger();
};
