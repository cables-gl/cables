// input
let value = op.inValue("value");

let phase = op.inValue("phase", 0.0);
let mul = op.inValue("frequency", 1.0);
let amplitude = op.inValue("amplitude", 1.0);
let invert = op.inValueBool("asine", false);

// output
let result = op.outValue("result");

let calculate = Math.sin;

phase.onChange =
value.onChange = function ()
{
    result.set(
        amplitude.get() * calculate((value.get() * mul.get()) + phase.get())
    );
};

invert.onChange = function ()
{
    if (invert.get()) calculate = Math.asin;
    else calculate = Math.sin;
};
