const
    inUpdate = op.inTrigger("Update"),
    inLimit = op.inInt("Limit", 30),
    inSlider = op.inBool("Slider", false),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Array");

const inPorts = [];
for (let i = 0; i < 30; i++)
{
    const inp = op.inFloat("Index " + i, 0);
    inPorts.push(inp);
}

const arr = [];
let to = null;

inUpdate.onTriggered = update;

inSlider.onChange = () =>
{
    const l = inLimit.get();

    for (let i = 0; i < inPorts.length; i++)
        if (inSlider.get()) inPorts[i].setUiAttribs({ "display": "range" });
        else inPorts[i].setUiAttribs({ "display": null });

    op.refreshParams();
};

inLimit.onChange = () =>
{
    clearTimeout(to);

    to = setTimeout(() =>
    {
        const l = inLimit.get();
        for (let i = 0; i < inPorts.length; i++)
        {
            inPorts[i].setUiAttribs({ "greyout": i >= l });
        }
    }, 300);
};

function update()
{
    const l = Math.max(0, Math.ceil(Math.min(inLimit.get(), inPorts.length)));
    arr.length = l;
    for (let i = 0; i < l; i++)
    {
        arr[i] = inPorts[i].get();
    }

    outArr.set(null);
    outArr.set(arr);
    next.trigger();
}
