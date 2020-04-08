
const num0 = op.inFloat("number 0",0),
    num1 = op.inFloat("number 1",0),
    mathDropDown = op.inSwitch("math mode",['+','-','*','/','%','min','max'], "+"),
    result = op.outNumber("result");

var selectIndex = 0;

const MATH_FUNC_ADD = 0;
const MATH_FUNC_SUB = 1;
const MATH_FUNC_MUL = 2;
const MATH_FUNC_DIV = 3;
const MATH_FUNC_MOD = 4;
const MATH_FUNC_MIN = 5;
const MATH_FUNC_MAX = 6;

num0.onChange = num1.onChange = update;
mathDropDown.onChange = onFilterChange;

function onFilterChange()
{
    var mathSelectValue = mathDropDown.get();
    if(mathSelectValue === '+') selectIndex = MATH_FUNC_ADD;
    else if(mathSelectValue === '-') selectIndex = MATH_FUNC_SUB;
    else if(mathSelectValue === '*') selectIndex = MATH_FUNC_MUL;
    else if(mathSelectValue === '/') selectIndex = MATH_FUNC_DIV;
    else if(mathSelectValue === '%') selectIndex = MATH_FUNC_MOD;
    else if(mathSelectValue === 'min') selectIndex = MATH_FUNC_MIN;
    else if(mathSelectValue === 'max') selectIndex = MATH_FUNC_MAX;
    update();
    op.setUiAttrib({"extendTitle":mathSelectValue});
}

function update()
{
    var n0 = num0.get();
    var n1 = num1.get();

    if(selectIndex === MATH_FUNC_ADD)
    {
       result.set(n0 + n1);
    }
    else if(selectIndex === MATH_FUNC_SUB)
    {
       result.set(n0 - n1);
    }
    else if(selectIndex === MATH_FUNC_MUL)
    {
       result.set(n0 * n1);
    }
    else if(selectIndex === MATH_FUNC_DIV)
    {
       result.set(n0 / n1);
    }
    else if(selectIndex === MATH_FUNC_MOD)
    {
       result.set(n0 % n1);
    }
    else if(selectIndex === MATH_FUNC_MIN)
    {
       result.set( Math.min(n0,n1));
    }
    else if(selectIndex === MATH_FUNC_MAX)
    {
       result.set(Math.max(n0,n1));
    }
}