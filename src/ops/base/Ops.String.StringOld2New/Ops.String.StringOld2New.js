const
    inStr=op.inValueString("String"),
    outStr=op.outString("Result");

inStr.onChange=function()
{
    outStr.set(inStr.get());

};