
const num0 = op.inFloat("number 0",0),
    num1 = op.inFloat("number 1",0),
    mathDropDown = op.inSwitch("math mode",['+','-','*','/','%','min','max'], "+"),
    result = op.outNumber("result");

num0.onChange = num1.onChange = mathDropDown.onChange = update;

function update()
{
    var mode = mathDropDown.get();
    var n0 = num0.get();
    var n1 = num1.get();

    op.setUiAttrib({"extendTitle":mode});

    if(mode === "+")
    {
       result.set(n0 + n1);
    }
    else if(mode === "-")
    {
       result.set(n0 - n1);
    }
    else if(mode === "*")
    {
       result.set(n0 * n1);
    }
    else if(mode === "/")
    {
       result.set(n0 / n1);
    }
    else if(mode === "%")
    {
       result.set(n0 % n1);
    }
    else if(mode === "min")
    {
       result.set( Math.min(n0,n1));
    }
    else if(mode === "max")
    {
       result.set(Math.max(n0,n1));
    }
}