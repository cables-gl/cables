const
    inNum=op.inValueFloat("Number"),
    result=op.outValue("Result");

inNum.onChange=function()
{
    result.set(2*(Math.round(inNum.get() / 2.0) ));
};

