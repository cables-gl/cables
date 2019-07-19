//The user can  pick a
//logical comparison which will be applied to the array.
// if it evaulates to true then it outputs 1 else 0
//pass mode (p) allows the value from array 0 through if the
//comparison evaulates to true else zero

const inArray_0 = op.inArray("array 0"),
    numberIn = op.inValueFloat("Number for comparison", 1.0),
    mathSelect = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=',
                '>pass','<pass','>=pass','<=pass','==pass','!=pass'],'>'),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

//cache for errors
var showingError = false;

//create array to store result
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
}

function update()
{
    var array0 = inArray_0.get();

    var mathNumberIn = numberIn.get();
    //reset array
    mathArray.length = 0;

    //check if arrays come in correctly on startup
    if(!array0)
    {
        outArray.set(null);
        return;
    }

    mathArray.length = array0.length;

    //create variable for for loop
    var i = 0;

    if(selectIndex === LOGIC_GREATER)
    {
        for(i = 0; i < array0.length; i++)
        {
            if(array0[i] > mathNumberIn)
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
            if(array0[i] < mathNumberIn)
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
            if(array0[i] >= mathNumberIn)
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
            if(array0[i] <= mathNumberIn)
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
            if(array0[i] === mathNumberIn)
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
            if(array0[i] !== mathNumberIn)
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
            if(array0[i] > mathNumberIn)
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
            if(array0[i] < mathNumberIn)
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
            if(array0[i] >= mathNumberIn)
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
            if(array0[i] <= mathNumberIn)
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
            if(array0[i] === mathNumberIn)
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
            if(array0[i] !== mathNumberIn)
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
    outArrayLength.set(mathArray.length);
};

inArray_0.onChange = update;
numberIn.onChange = update;
update();