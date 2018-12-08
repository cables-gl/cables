//this op allows the user to perform sin or cos
//math functions on an array
const inArray = op.inArray("array in");
const mathSelect = op.inValueSelect("Math function",["Sin","Cos"],"Sin");
const outArray = op.outArray("Array result");

const phase=op.inValue("Phase",0.0);
const multiply=op.inValue("Frequency",1.0);
const amplitude=op.inValue("Amplitude",1.0);

var mathArray = [];
var selectIndex = 0;

const MATH_FUNC_SIN = 0;
const MATH_FUNC_COS = 1;


inArray.onChange = update;
multiply.onChange = update;
amplitude.onChange = update;
phase.onChange = update;
mathSelect.onChange = onFilterChange;

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();
    if(mathSelectValue === "Sin") selectIndex = MATH_FUNC_SIN;
    else if(mathSelectValue === "Cos") selectIndex = MATH_FUNC_COS;
    update();
}

function update()
{
    var arrayIn = inArray.get();
    mathArray.length = 0;

    if(!arrayIn) return;

    mathArray.length = arrayIn.length;

    var amp = amplitude.get();
    var mul = multiply.get();
    var pha = phase.get();

    var i = 0;
    if(selectIndex === MATH_FUNC_SIN)
    {
        for(i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * Math.sin((arrayIn[i]) *  mul + pha);
    }
    else if(selectIndex === MATH_FUNC_COS)
    {
        for(i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * (Math.cos(arrayIn[i] * mul + pha));
    }
    outArray.set(null);
    outArray.set(mathArray);
}
