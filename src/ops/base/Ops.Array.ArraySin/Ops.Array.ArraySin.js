//this op allows the user to perform sin or cos
//math functions on an array
"use strict";
const inArray = op.inArray("array in");
const mathSelect = op.inValueSelect("Math function",['Sin','Cos']);
const outArray = op.outArray("Array result");

const phase=op.inValue("Phase");
const mul=op.inValue("Frequency");
const amplitude=op.inValue("Amplitude");

mathSelect.set('Sin');
mul.set(1);
amplitude.set(1);
phase.set(0);


var mathArray = [];
var selectIndex = 0;

const MATH_FUNC_SIN = 0;
const MATH_FUNC_COS = 1;


inArray.onChange = update;
mul.onChange = update;
amplitude.onChange = update;
phase.onChange = update;
mathSelect.onChange = onFilterChange;

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();
    if(mathSelectValue === 'Sin') selectIndex = MATH_FUNC_SIN;
    else if(mathSelectValue === 'Cos') selectIndex = MATH_FUNC_COS;
    update();
}

function update()
{
    var arrayIn = inArray.get();
    mathArray.length = 0;

    if(!arrayIn) return;

    mathArray.length = arrayIn.length;

    var i = 0;
    if(selectIndex === MATH_FUNC_SIN)
    {
        for(i = 0; i < arrayIn.length; i++)
            mathArray[i] = amplitude.get() * Math.sin((arrayIn[i]) *  mul.get() + phase.get())  ;
    }
    else if(selectIndex === MATH_FUNC_COS)
    {
        for(i = 0; i < arrayIn.length; i++)
            mathArray[i] = amplitude.get() * (Math.cos(arrayIn[i] * mul.get() + phase.get()) );
    }
    outArray.set(null);
    outArray.set(mathArray);
}


