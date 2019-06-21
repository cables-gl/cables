//this op expects 2 arrays. The user can then pick a
//logical comparison which will be applied to the
//two arrays. If arrays have a different length then a warning
//is given in the panel
//pass allows the value from array 0 through if the
//comparison evaulates to true else zero

const inArray_0 = op.inArray("array 0");
const inArray_1 = op.inArray("array 1");
const mathSelect = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=',
                                    '>pass','<pass','>=pass','<=pass','==pass','!=pass'],'>');
const outArray = op.outArray("Array result");

//cache for errors
var showingError = false;

//create array to store multiplied result from both arrays
var mathArray = [];
var selectIndex = 0;

const LOGIC_GREATER = 0,
    LOGIC_LESS = 1,
    LOGIC_GREATER_EQUALS = 2,
    LOGIC_LESS_EQUALS = 3,
    LOGIC_EQUAL = 4,
    LOGIC_NOT_EQUAL = 5,
    LOGIC_GREATER_PASS = 6,
    LOGIC_LESS_PASS = 7,
    LOGIC_GREATER_EQUAL_PASS = 8,
    LOGIC_LESS_EQUAL_PASS = 9,
    LOGIC_EQUAL_PASS = 10,
    LOGIC_NOT_EQUAL_PASS = 11;

mathSelect.onChange = onFilterChange;

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();
    if(mathSelectValue === '>') selectIndex = LOGIC_GREATER;
    else if(mathSelectValue === '<') selectIndex = LOGIC_LESS;
    else if(mathSelectValue === '>=') selectIndex = LOGIC_GREATER_EQUALS;
    else if(mathSelectValue === '<=') selectIndex = LOGIC_LESS_EQUALS;
    else if(mathSelectValue === '==') selectIndex = LOGIC_EQUAL;
    else if(mathSelectValue === '!=') selectIndex = LOGIC_NOT_EQUAL;
        else if(mathSelectValue === '>pass') selectIndex = LOGIC_GREATER_PASS;
        else if(mathSelectValue === '<pass') selectIndex = LOGIC_LESS_PASS;
        else if(mathSelectValue === '>=pass') selectIndex = LOGIC_GREATER_EQUAL_PASS;
        else if(mathSelectValue === '<=pass') selectIndex = LOGIC_LESS_EQUAL_PASS;
        else if(mathSelectValue === '==pass') selectIndex = LOGIC_EQUAL_PASS;
        else if(mathSelectValue === '!=pass') selectIndex = LOGIC_NOT_EQUAL_PASS;

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

    if(selectIndex === LOGIC_GREATER)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] > array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }

    }
    else if(selectIndex === LOGIC_LESS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] < array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_GREATER_EQUALS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] >= array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_LESS_EQUALS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] <= array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_EQUAL)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] === array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_NOT_EQUAL)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] !== array1[i])
            {
                mathArray[i] = 1;
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    //Pass section
    else if(selectIndex === LOGIC_GREATER_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] > array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_LESS_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] < array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_GREATER_EQUAL_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] >= array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_LESS_EQUAL_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] <= array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    else if(selectIndex === LOGIC_EQUAL_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] === array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }

    else if(selectIndex === LOGIC_NOT_EQUAL_PASS)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] !== array1[i])
            {
                mathArray[i] = array0[i];
            }
            else
            {
                mathArray[i] = 0;
            }
        }
    }
    outArray.set(null);
    outArray.set(mathArray);
};

inArray_0.onChange = update;
inArray_1.onChange = update;
update();