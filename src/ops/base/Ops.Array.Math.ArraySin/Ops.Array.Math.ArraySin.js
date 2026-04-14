// this op allows the user to perform sin or cos
// math functions on an array
const inArray = op.inArray("array in");
const mathSelect = op.inValueSelect("Math function", ["Sin", "Cos"], "Sin");
const outArray = op.outArray("Array result");

const phase = op.inValue("Phase", 0.0);
const multiply = op.inValue("Frequency", 1.0);
const amplitude = op.inValue("Amplitude", 1.0);

const mathArray = [];
let selectIndex = 0;

const MATH_FUNC_SIN = 0;
const MATH_FUNC_COS = 1;

inArray.onChange = update;
multiply.onChange = update;
amplitude.onChange = update;
phase.onChange = update;
mathSelect.onChange = onFilterChange;

function onFilterChange()
{
    const mathSelectValue = mathSelect.get();
    if (mathSelectValue === "Sin") selectIndex = MATH_FUNC_SIN;
    else if (mathSelectValue === "Cos") selectIndex = MATH_FUNC_COS;
    update();
}

function update()
{
    const arrayIn = inArray.get();

    if (!arrayIn)
    {
        mathArray.length = 0;
        return;
    }

    mathArray.length = arrayIn.length;

    const amp = amplitude.get();
    const mul = multiply.get();
    const pha = phase.get();

    let i = 0;
    if (selectIndex === MATH_FUNC_SIN)
    {
        for (i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * Math.sin((arrayIn[i]) * mul + pha);
    }
    else if (selectIndex === MATH_FUNC_COS)
    {
        for (i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * (Math.cos(arrayIn[i] * mul + pha));
    }
    // outArray.set(null);
    outArray.setRef(mathArray);
}
