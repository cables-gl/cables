var str=op.inValueString("String","a very very long default string");
var numChars=op.inValueInt("Max Line Chars",10);

var result=op.outValue('Result');

str.onChange=update;
numChars.onChange=update;
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
            // if(i>0)
            currentString+=strings[i];
            currentString+=" ";
        }
        else
        {
            string+=currentString.trim()+'\n';
            currentString=strings[i]+' ';//strings[i];
        }
    }

    result.set( (string+currentString).trim() );

}