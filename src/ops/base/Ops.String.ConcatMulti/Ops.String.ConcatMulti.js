const addSpacesCheckBox = op.inBool("add spaces", false),
    newLinesCheckBox = op.inBool("new lines", false),
    stringPorts = [],
    result = op.outString("concat string");

stringPorts.onChange = addSpacesCheckBox.onChange =
newLinesCheckBox.onChange = update;

addSpacesCheckBox.setUiAttribs({ "hidePort": true });
newLinesCheckBox.setUiAttribs({ "hidePort": true });

for (let i = 0; i < 8; i++)
{
    let p = op.inString("string " + i);
    stringPorts.push(p);
    p.onChange = update;
}

function update()
{
    let str = "";
    let nl = "";
    let space = addSpacesCheckBox.get();

    for (let i = 0; i < stringPorts.length; i++)
    {
        const inString = stringPorts[i].get();
        if (!inString) continue;
        if (space) str += " ";
        if (i > 0 && newLinesCheckBox.get()) nl = "\n";
        str += nl;
        str += inString;
    }
    result.set(str);
}
