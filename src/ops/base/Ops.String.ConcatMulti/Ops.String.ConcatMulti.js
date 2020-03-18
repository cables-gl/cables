
const addSpacesCheckBox = op.inBool("add spaces",false),
        newLinesCheckBox = op.inBool("new lines",false),
        stringPorts = [],
        result = op.outString("concat string");


stringPorts.onChange = addSpacesCheckBox.onChange =
newLinesCheckBox.onChange = update;

addSpacesCheckBox.hidePort(true);
newLinesCheckBox.hidePort(true);

for(var i=0; i<8; i++)
{
    var p=op.inString("string " + i);
    stringPorts.push(p);
    p.onChange = update;
}

function update()
{
    var str = "";
    var nl = "";
    var space = addSpacesCheckBox.get();

    for(var i=0; i<stringPorts.length; i++)
    {
        const inString=stringPorts[i].get();
        if(!inString)continue;
        if(space) str += " ";
        if(i>0 && newLinesCheckBox.get()) nl = '\n';
        str += nl;
        str += inString;
    }
    result.set(str);
}
