const
    parentPort = op.inObject("Parent"),
    outParent = op.outObject("Parent Out");

const inPorts = [];
for (let i = 0; i < 10; i++)
{
    const p = op.inObject("Child " + (i + 1));
    inPorts.push(p);
    p.onChange = rebuild;
}

parentPort.onChange = rebuild;

function rebuild()
{
    const parent = parentPort.get();
    if (!parent) return;

    let child = parent.lastElementChild;
    while (child)
    {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }

    for (let i = 0; i < inPorts.length; i++)
    {
        const p = inPorts[i].get();
        if (p && parent)
        {
            parent.appendChild(p);
        }
    }

    outParent.set(parent);
}
