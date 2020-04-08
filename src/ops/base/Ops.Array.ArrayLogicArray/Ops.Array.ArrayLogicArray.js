//this op expects 2 arrays. The user can then pick a
//logical comparison which will be applied to the
//two arrays. If arrays have a different length then a warning
//is given in the panel
//pass allows the value from array 0 through if the
//comparison evaulates to true else zero

const inArray_0 = op.inArray("array 0"),
    inArray_1 = op.inArray("array 1"),
    inValueIfTrue = op.inFloat("value if true",1.0),
    inValueIfFalse = op.inFloat("value if false",0.0),
    mathSelect = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=',
                '>pass','<pass','>=pass','<=pass','==pass','!=pass'],'>'),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

op.toWorkPortsNeedToBeLinked(inArray_1,inArray_0);

var logicFunc;
//cache for errors
var showingError = false;

//create array to store multiplied result from both arrays
var mathArray = [];
var selectIndex = 0;

mathSelect.onChange  = onFilterChange;

inArray_0.onChange = inArray_1.onChange =
inValueIfTrue.onChange = inValueIfFalse.onChange = update;

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
    var array1 = inArray_1.get();

    var valueFalse = inValueIfFalse.get();
    var valueTrue = inValueIfTrue.get();

    mathArray.length = 0;

    if(!array0 || !array1)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    if(array0.length !== array1.length)
    {
        outArray.set(null);
        outArrayLength.set(0);
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

    var i = 0;

    for(i = 0; i < array0.length; i++)
    {
        mathArray[i]= logicFunc(array0[i],array1[i],valueTrue,valueFalse);
    }

    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
};

