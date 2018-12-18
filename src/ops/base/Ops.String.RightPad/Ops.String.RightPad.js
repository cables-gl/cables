var val=op.inValue("Value",1);
var char=op.inValueString("Char",'0');
var num=op.inValueInt("Num",4);
var out=op.outValue("String");

val.onChange=update;
char.onChange=update;
num.onChange=update;

function update()
{
    var str=val.get()+'';
    for(var i=str.length;i<num.get();i++)
    {
        str+=char.get();
    }
    out.set(str);
}