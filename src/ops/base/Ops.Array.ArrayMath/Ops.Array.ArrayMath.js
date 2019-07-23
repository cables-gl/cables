const inArray_0 = op.inArray("array 0"),
    NumberIn = op.inValueFloat("Number for math", 0.0),
    mathSelect = op.inSwitch("Math function",['+','-','*','/','%','min','max'],'+'),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

//cache for errors
var showingError = false;
//create array to store mathematical result
var mathArray = [];
var selectIndex = 0;
mathSelect.onChange = NumberIn.onChange = onFilterChange;

const MATH_FUNC_ADD = 0;
const MATH_FUNC_SUB = 1;
const MATH_FUNC_MUL = 2;
const MATH_FUNC_DIV = 3;
const MATH_FUNC_MOD = 4;
const MATH_FUNC_MIN = 5;
const MATH_FUNC_MAX = 6;

onFilterChange();

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();
    if(mathSelectValue === '+') selectIndex = MATH_FUNC_ADD;
    else if(mathSelectValue === '-') selectIndex = MATH_FUNC_SUB;
    else if(mathSelectValue === '*') selectIndex = MATH_FUNC_MUL;
    else if(mathSelectValue === '/') selectIndex = MATH_FUNC_DIV;
    else if(mathSelectValue === '%') selectIndex = MATH_FUNC_MOD;
    else if(mathSelectValue === 'min') selectIndex = MATH_FUNC_MIN;
    else if(mathSelectValue === 'max') selectIndex = MATH_FUNC_MAX;
    update();
    op.setUiAttrib({"extendTitle":mathSelectValue});
}

function update()
{
    var array0 = inArray_0.get();

    //reset array
    mathArray.length = 0;

    //check if arrays come in correctly on startup
    if(!array0)
    {
        outArrayLength.set(0);
        return;
    }

    var num = NumberIn.get();
    mathArray.length = array0.length;

    //create variable for for loop
    var i = 0;
    //use selectIndex to decide which math mode is used on the array
    if(selectIndex === MATH_FUNC_ADD)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] + num;
    }
    else if(selectIndex === MATH_FUNC_SUB)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] - num;
    }
    else if(selectIndex === MATH_FUNC_MUL)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] * num;
    }
    else if(selectIndex === MATH_FUNC_DIV)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] / num;
    }
    else if(selectIndex === MATH_FUNC_MOD)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] % num;
    }
    else if(selectIndex === MATH_FUNC_MIN)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = Math.min(array0[i], num);
    }
    else if(selectIndex === MATH_FUNC_MAX)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = Math.max(array0[i], num);
    }
    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
}

inArray_0.onChange = update;
update();
