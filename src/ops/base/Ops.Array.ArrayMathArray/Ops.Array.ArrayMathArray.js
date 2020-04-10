const inArray_0 = op.inArray("array 0"),
    inArray_1 = op.inArray("array 1"),
    mathSelect = op.inSwitch("Math function",['+','-','*','/','%','min','max'],'+'),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

var mathFunc;

var showingError = false;

var mathArray = [];

op.toWorkPortsNeedToBeLinked(inArray_1,inArray_0);

mathSelect.onChange = onFilterChange;

inArray_0.onChange = inArray_1.onChange = update;
onFilterChange();

function onFilterChange()
{
    var mathSelectValue = mathSelect.get();

    if(mathSelectValue === '+')         mathFunc = function(a,b){return a+b};
    else if(mathSelectValue === '-')    mathFunc = function(a,b){return a-b};
    else if(mathSelectValue === '*')    mathFunc = function(a,b){return a*b};
    else if(mathSelectValue === '/')    mathFunc = function(a,b){return a/b};
    else if(mathSelectValue === '%')    mathFunc = function(a,b){return a%b};
    else if(mathSelectValue === 'min')  mathFunc = function(a,b){return Math.min(a,b)};
    else if(mathSelectValue === 'max')  mathFunc = function(a,b){return Math.max(a,b)};
    update();
    op.setUiAttrib({"extendTitle":mathSelectValue});
}

function update()
{
    var array0 = inArray_0.get();
    var array1 = inArray_1.get();

    mathArray.length = 0;

    if(!array0 || !array1)
    {
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
        mathArray[i] = mathFunc(array0[i],array1[i]);
    }

    outArray.set(null);
    outArrayLength.set(mathArray.length);
    outArray.set(mathArray);
}
