const num0 = op.inFloat("number 0",0),
    num1 = op.inFloat("number 1",0),
    mathDropDown = op.inSwitch("math mode",['+','-','*','/','%','min','max'], "+"),
    result = op.outNumber("result");

var mathFunc;

num0.onChange = num1.onChange = update;
mathDropDown.onChange = onFilterChange;

function onFilterChange()
{
    var mathSelectValue = mathDropDown.get();

    if(mathSelectValue == '+')         mathFunc = function(a,b){return a+b};
    else if(mathSelectValue == '-')    mathFunc = function(a,b){return a-b};
    else if(mathSelectValue == '*')    mathFunc = function(a,b){return a*b};
    else if(mathSelectValue == '/')    mathFunc = function(a,b){return a/b};
    else if(mathSelectValue == '%')    mathFunc = function(a,b){return a%b};
    else if(mathSelectValue == 'min')  mathFunc = function(a,b){return Math.min(a,b)};
    else if(mathSelectValue == 'max')  mathFunc = function(a,b){return Math.max(a,b)};

    update();
    op.setUiAttrib({"extendTitle":mathSelectValue});
}

function update()
{
   var n0 = num0.get();
   var n1 = num1.get();

   result.set(mathFunc(n0,n1));
}

onFilterChange();
