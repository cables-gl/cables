//The user can  pick a
//logical comparison which will be applied to the array.
// if it evaulates to true then it outputs 1 else 0 or defined value
//pass mode (p) allows the value from array 0 through if the
//comparison evaulates to true else value assigned to false

const inArray_0 = op.inArray("array 0"),
    mathSelect = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=',
                    '>pass','<pass','>=pass','<=pass','==pass','!=pass'],'>'),
    numberIn = op.inValueFloat("Number for comparison", 0.5),
    inValueIfTrue = op.inFloat("value if true",1.0),
    inValueIfFalse = op.inFloat("value if false",0.0),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

var logicFunc;
//cache for errors
var showingError = false;

//create array to store result
var mathArray = [];
var selectIndex = 0;

mathSelect.onChange = onFilterChange;


inArray_0.onChange = numberIn.onChange = inValueIfFalse.onChange =
inValueIfTrue.onChange = update;
onFilterChange();

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();
    if(mathSelectValue === '>') logicFunc =         function(val,comp,t,f)  { if(val > comp) return t; return f; };
    else if(mathSelectValue === '<') logicFunc =    function(val,comp,t,f)  { if(val < comp) return t; return f; };
    else if(mathSelectValue === '>=') logicFunc =   function(val,comp,t,f)  { if(val >= comp) return t; return f; };
    else if(mathSelectValue === '<=') logicFunc =   function(val,comp,t,f)  { if(val <= comp) return t; return f; };
    else if(mathSelectValue === '==') logicFunc =   function(val,comp,t,f)  { if(val === comp) return t; return f; };
    else if(mathSelectValue === '!=') logicFunc =   function(val,comp,t,f)  { if(val !== comp) return t; return f; };
        else if(mathSelectValue === '>pass')  logicFunc = function(val,comp,t,f)  { if(val > comp) return val; return f; };
        else if(mathSelectValue === '<pass')  logicFunc = function(val,comp,t,f)  { if(val < comp) return val; return f; };
        else if(mathSelectValue === '>=pass') logicFunc = function(val,comp,t,f)  { if(val >= comp) return val; return f; }
        else if(mathSelectValue === '<=pass') logicFunc = function(val,comp,t,f)  { if(val <= comp) return val; return f; }
        else if(mathSelectValue === '==pass') logicFunc = function(val,comp,t,f)  { if(val === comp) return val; return f; };
        else if(mathSelectValue === '!=pass') logicFunc = function(val,comp,t,f)  { if(val !== comp) return val; return f; };
    update();
    op.setUiAttrib({"extendTitle":mathSelectValue});
}

function update()
{
    var array0 = inArray_0.get();

    var mathNumberIn = numberIn.get();
    var valueFalse = inValueIfFalse.get();
    var valueTrue = inValueIfTrue.get();
    //reset array
    mathArray.length = 0;

    //check if arrays come in correctly on startup
    if(!array0)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    mathArray.length = array0.length;

    //create variable for the for loop
    var i = 0;

    if(selectIndex === LOGIC_GREATER)
    {
        for(i = 0; i < array0.length; i++)
        {
            mathArray[i] = logicFunc(array0[i],mathNumberIn,valueTrue,valueFalse)
            // if(array0[i] > mathNumberIn)
            // {
            //     mathArray[i] = valueTrue;
            // }
            // else
            // {
            //     mathArray[i] = valueFalse;
            // }
        }

    }
    // else if(selectIndex === LOGIC_LESS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] < mathNumberIn)
    //         {
    //             mathArray[i] = valueTrue;
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_GREATER_EQUALS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] >= mathNumberIn)
    //         {
    //             mathArray[i] = valueTrue;
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_LESS_EQUALS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] <= mathNumberIn)
    //         {
    //             mathArray[i] = valueTrue;
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_EQUAL)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] === mathNumberIn)
    //         {
    //             mathArray[i] = valueTrue;
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_NOT_EQUAL)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] !== mathNumberIn)
    //         {
    //             mathArray[i] = valueTrue;
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // //Pass section
    // else if(selectIndex === LOGIC_GREATER_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] > mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_LESS_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] < mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_GREATER_EQUAL_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] >= mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_LESS_EQUAL_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] <= mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    // else if(selectIndex === LOGIC_EQUAL_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] === mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }

    // else if(selectIndex === LOGIC_NOT_EQUAL_PASS)
    // {
    //     for(i = 0; i < array0.length; i++)
    //     {
    //         if(array0[i] !== mathNumberIn)
    //         {
    //             mathArray[i] = array0[i];
    //         }
    //         else
    //         {
    //             mathArray[i] = valueFalse;
    //         }
    //     }
    // }
    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
};
