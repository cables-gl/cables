const outArr = op.outArray("Result");

const NUM_PORTS = 8;
const inArrPorts = [];

let showingError = false;

for (let i = 0; i < NUM_PORTS; i++)
{
    let p = op.inArray("Array " + i);
    p.onChange = update;
    inArrPorts.push(p);
}

function update()
{
    const arr = [];
    const inArrays = [];
    let i = 0;

    for (i = 0; i < NUM_PORTS; i++)
    {
        let a = inArrPorts[i].get();
        if (a)
        {
            inArrays.push(a);
            if (a.length != inArrays[0].length)
            {
                if (!showingError)op.setUiError("arraylen", "Arrays do not have the same length !");
                outArr.set(null);
                showingError = true;
                return;
            }
        }
    }

    if (inArrays.length === 0)
    {
        if (!showingError)op.setUiError("invalid", "No Valid Arrays");
        // op.uiAttr({ "error": "No Valid Arrays" });
        outArr.set(null);
        showingError = true;
        return;
    }

    if (showingError)
    {
        op.setUiError("arraylen", null);
        op.setUiError("invalid", null);
    }
    showingError = false;

    for (let j = 0; j < inArrays[0].length; j++)
        for (i = 0; i < inArrays.length; i++)
            arr.push(inArrays[i][j]);

    outArr.setRef(arr);
}
