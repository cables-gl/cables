//The user can  pick a
//logical comparison which will be applied to the array.
// if it evaulates to true then it outputs 1 else 0 or defined value
//pass mode (p) allows the value from array 0 through if the
//comparison evaulates to true else its the value assigned to if false

const inArray_0 = op.inArray("array 0"),
    mathSelect = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=',
                    '>pass','<pass','>=pass','<=pass','==pass','!=pass'],'>'),
    numberIn = op.inValueFloat("Number for comparison", 0.5),
    inValueIfTrue = op.inFloat("value if true",1.0),
    inValueIfFalse = op.inFloat("value if false",0.0),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

op.toWorkPortsNeedToBeLinked(inArray_0);

var logicFunc;
var showingError = false;

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

    mathArray.length = 0;

    if(!array0)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    mathArray.length = array0.length;

    var i = 0;

    for(i = 0; i < array0.length; i++)
    {
        mathArray[i] = logicFunc(array0[i],mathNumberIn,valueTrue,valueFalse)

    }

    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
};
