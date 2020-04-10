const inArray_0 = op.inArray("array 0"),
    NumberIn = op.inValueFloat("Number for math", 0.0),
    mathSelect = op.inSwitch("Math function",['+','-','*','/','%','min','max'],'+'),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

var mathFunc;

var showingError = false;

var mathArray = [];

inArray_0.onChange = NumberIn.onChange =update;
mathSelect.onChange = onFilterChange;

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

    mathArray.length = 0;

    if(!array0)
    {
        outArrayLength.set(0);
        outArray.set(null);
        return;
    }

    var num = NumberIn.get();
    mathArray.length = array0.length;

    var i = 0;

    for(i = 0; i < array0.length; i++)
    {
        mathArray[i] = mathFunc(array0[i], num);
    }

    outArray.set(null);
    outArray.set(mathArray);
    outArrayLength.set(mathArray.length);
}

