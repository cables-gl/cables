// look at http://sol.gfxile.net/interpolation/
const exec = op.inTrigger("Execute"),
    inArray = op.inArray("Array In"),
    inModeBool = op.inBool("Separate inc/dec", false),
    incFactor = op.inValue("Inc factor", 4),
    decFactor = op.inValue("Dec factor", 4),
    next = op.outTrigger("Next"),
    outArray = op.outArray("Array Out");

let goal = [];
let reset = false;
let lastTrigger = 0;

let newArr = [];
outArray.set(newArr);

let divisorUp;
let divisorDown;

let selectedMode = false;

onFilterChange();
getDivisors();
function onFilterChange()
{
    selectedMode = inModeBool.get();

    if (!selectedMode)
    {
        decFactor.setUiAttribs({ "greyout": true });
        incFactor.setUiAttribs({ "title": "Inc/Dec factor" });
    }
    else
    {
        decFactor.setUiAttribs({ "greyout": false });
        incFactor.setUiAttribs({ "title": "Inc factor" });
    }

    getDivisors();
    update();
}

function getDivisors()
{
    divisorUp = incFactor.get();

    if (selectedMode == false) divisorDown = incFactor.get();
    else divisorDown = decFactor.get();

    if (divisorUp <= 0 || divisorUp != divisorUp)divisorUp = 0.0001;
    if (divisorDown <= 0 || divisorDown != divisorDown)divisorDown = 0.0001;
    if (divisorUp <= 1.0) divisorUp = 1.0;
    if (divisorDown <= 1.0) divisorDown = 1.0;
}

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        goal[i] = arr[i] || 0;
    }
};

let oldVal = 0;

function update()
{
    let arr = inArray.get();
    if (!arr) return;

    if (newArr.length != arr.length)
    {
        newArr.length = arr.length || 0;
        reset = true;
    }

    let tm = 1;
    if (CABLES.now() - lastTrigger > 500 || lastTrigger === 0)reset = true;
    else tm = (CABLES.now() - lastTrigger) / 17;
    lastTrigger = CABLES.now();

    if (reset)
    {
        for (var i = 0; i < arr.length; i++)
        {
            newArr[i] = arr[i];
        }
        reset = false;
    }

    for (var i = 0; i < arr.length; i++)
    {
        let val = newArr[i];

        let diff = goal[i] - val;

        if (diff >= 0)
            val += (diff) / (divisorDown * tm);
        else
            val += (diff) / (divisorUp * tm);

        if (val > 0 && val < 0.000000001)val = 0;
        if (!val) val = 0;

        if (newArr[i] != val)
        {
            newArr[i] = val;
            oldVal = val;
        }
    }
    // outArray.set(null);
    outArray.setRef(newArr);

    next.trigger();
}

exec.onTriggered = function ()
{
    update();
};

incFactor.onChange = decFactor.onChange = getDivisors;
inModeBool.onChange = onFilterChange;
update();
