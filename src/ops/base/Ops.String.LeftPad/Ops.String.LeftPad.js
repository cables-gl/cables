var val=op.inValue("Value",1);
var char=op.inValueString("Char",'0');
var num=op.inValue("Num",4);
var out=op.outValue("String");

val.onChange=update;
char.onChange=update;
num.onChange=update;

function update()
{
    var v=Math.floor(val.get());
    var n=Math.floor(num.get());

    var pad='';
    for(var i=0;i<n;i++)pad+=(''+char.get());
    
    var str=v+'';
    str = pad.substring(0, pad.length - str.length) + str;

    out.set(str);
}