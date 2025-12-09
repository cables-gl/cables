const addSpacesCheckBox = op.inBool("add spaces", false),
    newLineX = op.inBool("new lines", false),
    result = op.outString("concat string"),
    outArr = op.outArray("Result"),
    outLines = op.outNumber("Total Lines");

const
    stringPorts = [],
    arrayPorts = [];

stringPorts.onChange =
    addSpacesCheckBox.onChange =
    newLineX.onChange = update;

for (let i = 0; i < 8; i++)
{
    let p = op.inString("String " + i);
    let pA = op.inArray("Array " + i);
    stringPorts.push(p);
    arrayPorts.push(pA);

    p.onChange =
        pA.onChange = update;
}

function update()
{
    let str = "";
    let nl = "";
    let space = addSpacesCheckBox.get();
    let line = 0;
    let numLines = 1;
    let countStringLines = 0;

    for (let i = 0; i < arrayPorts.length; i++)
    {
        if (arrayPorts[i].get()) numLines = Math.max(numLines, arrayPorts[i].get().length);
    }

    for (let j = 0; j < numLines; j++)
    {
        for (let i = 0; i < stringPorts.length; i++)
        {
            const inString = stringPorts[i].get();
            const inArray = arrayPorts[i].get();
            if (!inString && !inArray) continue;
            if (i > 0 && space) str += " ";

            str += inString;
            if (inArray)
            {
                if (space)str += " ";
                str += inArray[j];
            }
        }
        if (newLineX.get())
        {
            str += "\n";
            countStringLines++;
        }
    }

    result.set(str);
    outLines.set(countStringLines);
}
