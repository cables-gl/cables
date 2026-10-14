var val=op.inFloat("Value",1);
var char=op.inValueString("Char",'0');
var num=op.inInt("Num",4);
var out=op.outNumber("String");

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