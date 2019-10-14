const
    inStr=op.inString("String","default"),
    outNum=op.outNumber("Total Lines",0);


inStr.onChange=function()
{
    var strings=inStr.get().split('\n');
    outNum.set(strings.length);


};