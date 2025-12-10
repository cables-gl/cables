// look at http://sol.gfxile.net/interpolation/

let divisor = 5;

let exec = op.inTrigger("Update");
let inVal = op.inValue("Value");

let next = op.outTrigger("Next");
let inDivisor = op.inValue("Divisor", divisor);
let result = op.outValue("Result", 0);

let val = 0;
let goal = 0;

let lastTrigger = 0;

inVal.onChange = function ()
{
    goal = inVal.get();
};

inDivisor.onChange = function ()
{
    divisor = inDivisor.get();
    if (divisor == 0)divisor = 5;
};

let oldVal = 0;

exec.onTriggered = function ()
{
    if (CABLES.now() - lastTrigger > 500)val = inVal.get();
    lastTrigger = CABLES.now();

    if (divisor <= 0)divisor = 0.0001;
    val += (goal - val) / divisor;

    if (val > 0 && val < 0.000000001)val = 0;
    if (divisor != divisor)val = 0;

    if (oldVal != val)
    {
        result.set(val);
        oldVal = val;
    }

    next.trigger();
};
