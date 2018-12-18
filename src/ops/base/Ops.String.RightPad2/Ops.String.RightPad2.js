const
    val=op.inString("Value",1),
    char=op.inString("Char",'0'),
    num=op.inValueInt("Num",4),
    out=op.outString("String");

val.onChange=
char.onChange=
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