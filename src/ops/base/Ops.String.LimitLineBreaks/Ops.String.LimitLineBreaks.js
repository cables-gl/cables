const
    inStr=op.inString("String","default"),
    inNum=op.inInt("Num Lines",0),
    outStr=op.outString("Result","default");

inStr.onChange=
inNum.onChange=function()
{
    var strings=inStr.get().split('\n');
    strings.length=Math.min(inNum.get(),strings.length);
    outStr.set(strings.join('\n'));
};