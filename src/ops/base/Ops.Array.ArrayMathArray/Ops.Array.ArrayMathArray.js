//this op expects 2 arrays. The user can then pick a
//mathematical function which will be applied to the
//two arrays. If arrays have a different length then a warning
//is given in the panel
const inArray_0 = op.inArray("array 0");
const inArray_1 = op.inArray("array 1");
const mathSelect = op.inSwitch("Math function",['+','-','*','/','%','min','max'],'+');
const outArray = op.outArray("Array result");

//cache for errors
var showingError = false;
//create array to store multiplied result from both arrays
var mathArray = [];
var selectIndex = 0;

op.toWorkPortsNeedToBeLinked(inArray_1,inArray_0);

const MATH_FUNC_ADD = 0;
const MATH_FUNC_SUB = 1;
const MATH_FUNC_MUL = 2;
const MATH_FUNC_DIV = 3;
const MATH_FUNC_MOD = 4;
const MATH_FUNC_MIN = 5;
const MATH_FUNC_MAX = 6;

mathSelect.onChange = onFilterChange;

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
    var array1 = inArray_1.get();
    //reset array
    mathArray.length = 0;

    //check if arrays come in correctly on startup
    if(!array0 || !array1)
    {
        return;
    }
    //if arrays don't have the same length then give a warning to panel ui
    if(array0.length !== array1.length)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays do not have the same length !"});
            showingError = true;
        }
        return;
    }
    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }


    mathArray.length = array0.length;

    //create variable for for loop
    var i = 0;
    //use selectIndex to decide which math mode is used on the 2 arrays
    if(selectIndex === MATH_FUNC_ADD)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] + array1[i];
    }
    else if(selectIndex === MATH_FUNC_SUB)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] - array1[i];
    }
    else if(selectIndex === MATH_FUNC_MUL)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] * array1[i];
    }
    else if(selectIndex === MATH_FUNC_DIV)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] / array1[i];
    }
    else if(selectIndex === MATH_FUNC_MOD)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = array0[i] % array1[i];
    }
    else if(selectIndex === MATH_FUNC_MIN)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = Math.min(array0[i], array1[i]);
    }
    else if(selectIndex === MATH_FUNC_MAX)
    {
        for(i = 0; i < array0.length; i++)
            mathArray[i] = Math.max(array0[i], array1[i]);
    }
    outArray.set(null);
    outArray.set(mathArray);
}

inArray_0.onChange = update;
inArray_1.onChange = update;

update();