const
    inStr=op.inString("String",""),
    inNum=op.inInt("Add Num Breaks",1),
    outStr=op.outString("HTML");

inNum.onChange=
inStr.onChange=function()
{
    var str=inStr.get();
    var newlines='';

    for(var i=0;i<inNum.get();i++) newlines+='<br/>';

    if(str) str = str.replace(/(?:\r\n|\r|\n)/g, newlines);
    outStr.set(str);

};