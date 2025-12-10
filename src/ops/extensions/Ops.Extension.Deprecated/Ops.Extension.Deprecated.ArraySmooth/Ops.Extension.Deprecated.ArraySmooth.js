const
    exec = op.inTrigger("Update"),
    inMode = op.inBool("Separate inc/dec", false),
    inVals = op.inArray("Array"),
    next = op.outTrigger("Next"),
    inDivisorUp = op.inValue("Inc factor", 4),
    inDivisorDown = op.inValue("Dec factor", 4),
    resultArr = op.outArray("Result");

// let val = 0;
// let goal = 0;
// let oldVal = 0;
let lastTrigger = 0;
let divisorUp;
let divisorDown;
let divisor = 4;

let finished = [];
let goal = [];
let oldVal = [];

let vals = [];

op.toWorkPortsNeedToBeLinked(exec);
let selectIndex = 0;
const MODE_SINGLE = 0;
const MODE_UP_DOWN = 1;

onFilterChange();
getDivisors();

inMode.setUiAttribs({ "hidePort": true });

inDivisorUp.onChange = inDivisorDown.onChange = getDivisors;
inMode.onChange = onFilterChange;
update();

inVals.onLinkChanged = () =>
{
    if (inVals) inVals.copyLinkedUiAttrib("stride", resultArr);
};

function onFilterChange()
{
    const selectedMode = inMode.get();
    if (!selectedMode) selectIndex = MODE_SINGLE;
    else selectIndex = MODE_UP_DOWN;

    if (selectIndex == MODE_SINGLE)
    {
        inDivisorDown.setUiAttribs({ "greyout": true });
        inDivisorUp.setUiAttribs({ "title": "Inc/Dec factor" });
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        inDivisorDown.setUiAttribs({ "greyout": false });
        inDivisorUp.setUiAttribs({ "title": "Inc factor" });
    }

    getDivisors();
    update();
}

function getDivisors()
{
    if (selectIndex == MODE_SINGLE)
    {
        divisorUp = inDivisorUp.get();
        divisorDown = inDivisorUp.get();
    }
    else if (selectIndex == MODE_UP_DOWN)
    {
        divisorUp = inDivisorUp.get();
        divisorDown = inDivisorDown.get();
    }

    if (divisorUp <= 0.2 || divisorUp != divisorUp)divisorUp = 0.2;
    if (divisorDown <= 0.2 || divisorDown != divisorDown)divisorDown = 0.2;
}

// inVal.onChange = function ()
// {
//     finished = false;
//     let oldGoal = goal;
//     goal = inVal.get();
// };

inVals.onChange = () =>
{
    const inArr = inVals.get();
    if (!inArr) return;

    goal.length = inArr.length;
    for (let i = 0; i < inArr.length; i++)
    {
        goal[i] = inArr[i];
    }
    // update();
};

inDivisorUp.onChange = function ()
{
    getDivisors();
};

function update()
{
    const inArr = inVals.get();
    if (!inArr) return;

    let tm = 1;
    if (performance.now() - lastTrigger > 500 || lastTrigger === 0)
    {
        // val = inVal.get() || 0;
        for (let i = 0; i < inArr.length; i++)
        {
            vals[i] = inArr[i];
        }
    }
    else tm = (performance.now() - lastTrigger) / (performance.now() - lastTrigger);
    lastTrigger = performance.now();

    vals.length = inArr.length;
    for (let i = 0; i < inArr.length; i++)
    {
        let val = vals[i];
        if (val === undefined)val = inArr[i];

        if (val != val)val = 0;

        if (divisor <= 0)divisor = 0.0001;

        const diff = goal[i] - val;

        if (diff >= 0) val += (diff) / (divisorDown * tm);
        else val += (diff) / (divisorUp * tm);

        if (Math.abs(diff) < 0.00001)val = goal[i];

        if (divisor != divisor)val = 0;
        if (val != val || val == -Infinity || val == Infinity)val = inArr[i];

        // if (oldVal != val)
        // {
        //     result.set(val);
        //     oldVal = val;
        // }

        if (val == goal[i] && !finished)
        {
            finished = true;
            // vals[i]=val;
            // result.set(val);
        }
        vals[i] = val;
    }

    resultArr.setRef(vals);

    next.trigger();
}

exec.onTriggered = function ()
{
    update();
};
