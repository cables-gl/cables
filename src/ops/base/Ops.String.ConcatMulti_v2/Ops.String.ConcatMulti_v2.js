const stringPorts = [];
for (let i = 0; i < 8; i++)
{
    let p = op.inString("string " + i);
    stringPorts.push(p);
    p.onChange = update;
}

const
    addSpacesCheckBox = op.inBool("add spaces", false),
    newLinesCheckBox = op.inBool("new lines", false),
    result = op.outString("concat string");

stringPorts.onChange =
    addSpacesCheckBox.onChange =
    newLinesCheckBox.onChange = update;

addSpacesCheckBox.setUiAttribs({ "hidePort": true });
newLinesCheckBox.setUiAttribs({ "hidePort": true });

function update()
{
    let str = "";
    let nl = "";
    let space = addSpacesCheckBox.get();

    for (let i = 0; i < stringPorts.length; i++)
    {
        const inString = stringPorts[i].get();
        if (!inString) continue;
        if (i > 0 && space) str += " ";
        if (i > 0 && newLinesCheckBox.get()) nl = "\n";
        str += nl;
        str += inString;
    }
    result.set(str);
}
