const
    str=op.inString("String","a very very long default string"),
    numChars=op.inValueInt("Max Line Chars",10),
    result=op.outString('Result');

str.onChange=numChars.onChange=update;
update();

function update()
{
    if(!str.get() && str.isLinked)
    {
        result.set('');
        return;
    }

    if(!str.get())return;
    var strings=str.get().split(" ");

    var string='';
    var currentString='';

    for(var i=0;i<strings.length;i++)
    {
        if(currentString.length+strings[i].length<numChars.get())
        {
            currentString+=strings[i];
            currentString+=" ";
        }
        else
        {
            string+=currentString.trim()+'\n';
            currentString=strings[i]+' ';
        }
    }

    result.set( (string+currentString).trim() );

}