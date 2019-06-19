const addSpacesCheckBox =op.inBool("add spaces",false);
const newLinesCheckBox =op.inBool("new lines",false);

var stringPorts=[];
var result=op.outString("concat string");

stringPorts.onChange = addSpacesCheckBox.onChange =
newLinesCheckBox.onChange = update;

addSpacesCheckBox.hidePort(true);
newLinesCheckBox.hidePort(true);

for(var i=0;i<8;i++)
{
    var p=op.inString("string "+i);
    stringPorts.push( p );
    p.onChange=update;
}

function update()
{
    var str = "";
    var nl = "";
    var space = addSpacesCheckBox.get();

    for(var i = 0; i < stringPorts.length;i++)
    {
        if(space && stringPorts[i].get())  str += " ";
        if(newLinesCheckBox.get()) nl = '\n';
            str += nl;
            str += stringPorts[i].get();
    }
    result.set(str);
}
