const
    logicSelectMode = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=','><','>=<'],'>'),
    numberIn_1 = op.inFloat("Value in",0),
    numberIn_2 = op.inFloat("Condition value",1),
    numberIn_3 = op.inFloat("Max",1),

    resultNumberOut = op.outNumber("Result");

var logicFunc;

logicSelectMode.onChange=onFilterChange;

numberIn_1.onChange = numberIn_2.onChange = numberIn_3.onChange=update;

onFilterChange();

function onFilterChange()
{
    var logicSelectValue = logicSelectMode.get();
    if(logicSelectValue === '>')        logicFunc = function(a,b,c) { if(a > b) return 1; return 0; };
    else if(logicSelectValue === '<')   logicFunc = function(a,b,c) { if(a < b) return 1; return 0; };
    else if(logicSelectValue === '>=')  logicFunc = function(a,b,c) { if(a >= b) return 1; return 0; };
    else if(logicSelectValue === '<=')  logicFunc = function(a,b,c) { if(a <= b) return 1; return 0; };
    else if(logicSelectValue === '==')  logicFunc = function(a,b,c) { if(a === b) return 1; return 0; };
    else if(logicSelectValue === '!=')  logicFunc = function(a,b,c) { if(a !== b) return 1; return 0; };
    else if(logicSelectValue === '><')  logicFunc = function(a,b,c) { if(a>Math.min(b,c) && a<Math.max(b,c ) ) return 1; return 0; };
    else if(logicSelectValue === '>=<') logicFunc = function(a,b,c) { if(a>=Math.min(b,c) && a<=Math.max(b,c )) return 1; return 0; };

    if (logicSelectValue === '><' || logicSelectValue === '>=<')
    {
        numberIn_3.setUiAttribs({greyout:false});
        numberIn_2.setUiAttribs({title:"Min"});
    }
    else
    {
        numberIn_3.setUiAttribs({greyout:true});
        numberIn_2.setUiAttribs({title:"Condition value"});
    }
    update();
    op.setUiAttrib({"extendTitle":logicSelectValue});
};

function update()
{
    var n1 = numberIn_1.get();
    var n2 = numberIn_2.get();
    var n3 = numberIn_3.get();

    var resultNumber = logicFunc(n1,n2,n3);

    resultNumberOut.set(resultNumber);
};




