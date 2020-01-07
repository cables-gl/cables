const
    numberIn_1 = op.inFloat("Number 1",0),
    numberIn_2 = op.inFloat("Number 2",1),
    numberIn_3 = op.inFloat("Value",0),
    logicSelectMode = op.inValueSelect("Comparison mode",['>','<','>=','<=','==','!=','><','>=<'],'>'),
    resultNumberOut = op.outNumber("Result number"),
    resultBooleanOut = op.outBool("Result boolean"),
    triggerOutIfTrue = op.outTrigger("Trigger true"),
    triggerOutIfFalse = op.outTrigger("Trigger false");

var selectIndex = 0;

const LOGIC_GREATER = 0,
    LOGIC_LESS = 1,
    LOGIC_GREATER_EQUALS = 2,
    LOGIC_LESS_EQUALS = 3,
    LOGIC_EQUAL = 4,
    LOGIC_NOT_EQUAL = 5,
    BETWEEN = 6,
    BETWEEN_EQUALS = 7;

logicSelectMode.onChange=onFilterChange;

function onFilterChange()
{
    var logicSelectValue = logicSelectMode.get();
    if(logicSelectValue === '>') selectIndex = LOGIC_GREATER;
    else if(logicSelectValue === '<') selectIndex = LOGIC_LESS;
    else if(logicSelectValue === '>=') selectIndex = LOGIC_GREATER_EQUALS;
    else if(logicSelectValue === '<=') selectIndex = LOGIC_LESS_EQUALS;
    else if(logicSelectValue === '==') selectIndex = LOGIC_EQUAL;
    else if(logicSelectValue === '!=') selectIndex = LOGIC_NOT_EQUAL;
    else if(logicSelectValue === '><') selectIndex = BETWEEN;
    else if(logicSelectValue === '>=<') selectIndex = BETWEEN_EQUALS;

    if (selectIndex === 6 || selectIndex == 7) numberIn_3.setUiAttribs({greyout:false});
        else numberIn_3.setUiAttribs({greyout:true});

    update();
    op.setUiAttrib({"extendTitle":logicSelectValue});
};

function update()
{
    var n1 = numberIn_1.get();
    var n2 = numberIn_2.get();
    var n3 = numberIn_3.get();

    var resultNumber = 0;
    var resultBoolean = false;

    if(selectIndex === LOGIC_GREATER)
    {
        if(n1 > n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === LOGIC_LESS)
    {
        if(n1 < n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === LOGIC_GREATER_EQUALS)
    {
        if(n1 >= n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === LOGIC_LESS_EQUALS)
    {
        if(n1 <= n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === LOGIC_EQUAL)
    {
        if(n1 === n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === LOGIC_NOT_EQUAL)
    {
        if(n1 !== n2)
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === BETWEEN)
    {
        if(n3 > Math.min(n1 , n2 )  &&
            n3 < Math.max(n1 , n2 ) )
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }
    else if(selectIndex === BETWEEN_EQUALS)
    {
        if(n3 >= Math.min(n1 , n2 )  &&
            n3 <= Math.max(n1 , n2 ) )
        {
            resultNumber=1;
            resultBoolean=true;
        }
    }

    resultNumberOut.set(resultNumber);
    resultBooleanOut.set(resultBoolean);

    if(resultBoolean) triggerOutIfTrue.trigger();
        else triggerOutIfFalse.trigger();

};

numberIn_1.onChange = numberIn_2.onChange = numberIn_3.onChange=update;
update();
onFilterChange();


