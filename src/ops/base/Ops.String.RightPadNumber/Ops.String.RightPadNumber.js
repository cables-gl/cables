const val=op.inValue("Value",1);
const num=op.inValueInt("Num",4);
const out=op.outValue("String");

val.onChange=update;
num.onChange=update;

function update()
{
    var str=val.get()+'';
    
    var start=str.indexOf(".");
    var numChars=num.get();
    
    if(start==-1)
    {
        str+='.';
    }
    else
    {
        var parts=str.split(".");
        numChars=num.get()-parts[1].length;
    }

    for(var i=0;i<numChars;i++)
        str+="0";

    out.set(str);
}