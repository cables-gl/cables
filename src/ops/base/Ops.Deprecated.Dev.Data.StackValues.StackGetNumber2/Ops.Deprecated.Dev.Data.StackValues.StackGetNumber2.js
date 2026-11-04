const
    inExec = op.inTrigger("Exec"),
    inNameDrop = op.inDropDown("Name Select", []),
    inName = op.inString("Name", "Default"),
    outNext = op.outTrigger("Next"),
    outValue = op.outNumber("Value", 0);

op.patch.stackValues = op.patch.stackValues || {};

let vName = "";

inName.onChange = updateName;
updateName();

function updateName()
{
    vName = inName.get();
    op.setUiAttrib({ "extendTitle": vName });
}

let wordList = [];

inNameDrop.onChange = () =>
{
    if (op.isCurrentUiOp())
        inName.set(inNameDrop.get());
};

inExec.onTriggered = () =>
{
    if (op.isCurrentUiOp())
    {
        let names = [""];
        if (op.patch.stackValues)
            for (let i in op.patch.stackValues)
            {
                if (CABLES.isNumeric(op.patch.stackValues[i][0]))
                {
                    names.push(i);
                    // console.log(i);
                }
                // else console.log("NUT NOMBER",i);
            }
        // /
        inNameDrop.setUiAttribs({ "values": names });
    }

    if (op.patch.stackValues.hasOwnProperty(vName) && op.patch.stackValues[vName].length > 0)
        outValue.set(op.patch.stackValues[vName][op.patch.stackValues[vName].length - 1]);
    else
        outValue.set(0);

    outNext.trigger();
};
