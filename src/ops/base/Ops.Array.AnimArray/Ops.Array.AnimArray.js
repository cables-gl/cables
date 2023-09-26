const
    inTrigger = op.inTrigger("Update"),
    inMat = op.inArray("Next Matrix"),
    // inStart=op.inTriggerButton("Start Anim"),
    inDur = op.inFloat("Duration", 1),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Matrix");

let lastTime = 0;
let startTime = 0;
let firsttime = true;
let cycle = 1;

const anim = new CABLES.Anim();
anim.createPort(op, "easing", init);
anim.loop = false;

let lastMat = null;

inDur.onChange = inMat.onChange = init;

const a = vec3.create();
const b = vec3.create();

let arr1, arr2;
let result = mat4.create();

inTrigger.onTriggered = () =>
{
    let t = CABLES.now() / 1000;

    const perc = anim.getValue(t);

    if (arr1 && arr2) ipMat(perc);
};

function matEquals(a, b)
{
    return (
        a[0] == b[0] &&
        a[1] == b[1] &&
        a[2] == b[2] &&
        a[3] == b[3] &&
        a[4] == b[4] &&
        a[5] == b[5] &&
        a[6] == b[6] &&
        a[7] == b[7] &&
        a[8] == b[8] &&
        a[9] == b[9] &&
        a[10] == b[10] &&
        a[11] == b[11] &&
        a[12] == b[12] &&
        a[13] == b[13] &&
        a[14] == b[14] &&
        a[15] == b[15]);
}

function init()
{
    if (!inMat.get()) return;
    if (inMat.get() == lastMat)
    {
        // mat4.copy(result,inMat.get());
        return;
    }

    if (lastMat)
        if (inMat.get() == lastMat && matEquals(inMat.get(), lastMat))
        {
            return;
        }

    lastMat = inMat.get();
    startTime = performance.now();
    anim.clear(CABLES.now() / 1000.0);

    // if(firsttime)
    anim.setValue(CABLES.now() / 1000.0, cycle);

    if (cycle == 1) cycle = 0;
    else cycle = 1;

    if (cycle == 0)
    {
        arr1 = inMat.get();
        arr2 = mat4.create();
        mat4.copy(arr2, result);
    }
    else
    {
        arr1 = mat4.create();
        arr2 = inMat.get();
        mat4.copy(arr1, result);
    }

    anim.setValue(inDur.get() + CABLES.now() / 1000.0, cycle, () =>
    {
        // result=outArr.get();
    });

    firsttime = false;
}

function ip(val1, val2, perc)
{
    return ((val2 - val1) * perc + val1);
}

function ipMat(perc)
{
    if (!arr1 || !arr2 || arr1.length != arr2.length)
    {
        outArr.set(null);
        op.logError("arrays wrong", arr1.length, arr2.length);
    }
    else
    {
        // getYPR(a, arr1);
        // getYPR(b, arr2);

        for (let i = 0; i < arr1.length; i++)
        {
            result[i] = ip(arr1[i], arr2[i], perc);
        }
        // mat4.identity(result);
        // result[12] = ip(arr1[12], arr2[12], perc);
        // result[13] = ip(arr1[13], arr2[13], perc);
        // result[14] = ip(arr1[14], arr2[14], perc);

        // vec3.lerp(a, a, b, perc);

        // mat4.rotateZ(result, result, a[2]);
        // mat4.rotateY(result, result, a[1]);
        // mat4.rotateX(result, result, a[0]);

        outArr.setRef(result);
    }
    next.trigger();
}
