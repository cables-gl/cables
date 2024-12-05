const
    parentPort = op.inObject("Parent", null, "element"),
    outParent = op.outObject("Parent Out", null, "element");

const canvas = op.patch.cgl.canvas.parentElement;

op.toWorkPortsNeedToBeLinked(parentPort);

const inPorts = [];
for (let i = 0; i < 10; i++)
{
    const p = op.inObject("Child " + (i + 1), null, "element");
    inPorts.push(p);
    p.onChange = () =>
    {
        rebuild();
        if (!p.get())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) delete currentChild.dataset.cablesChildId;
        }
    };
    p.onLinkChanged = () =>
    {
        if (!p.isLinked())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) currentChild.remove();
        }
    };
}

parentPort.onLinkChanged = () =>
{
    if (!parentPort.isLinked())
    {
        cleanUp();
    }
    else
    {
        rebuild();
    }
};

outParent.onLinkChanged = () =>
{
    if (!outParent.isLinked())
    {
        const parentDiv = parentPort.get();
        if (parentDiv && parentDiv.dataset.op)
        {
            const inDoc = canvas.querySelector("[data-op=' " + parentDiv.dataset.op + " ']");
            if (!inDoc)
            {
                canvas.appendChild(parentDiv);
            }
        }
    }
};

parentPort.onChange = () =>
{
    if (!parentPort.get())
    {
        cleanUp();
    }
    rebuild();
};

function cleanUp()
{
    for (let i = 0; i < inPorts.length; i++)
    {
        const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
        const currentChild = canvas.querySelector(selector);
        if (currentChild && currentChild.parentNode)
        {
            currentChild.remove();
        }
    }
    outParent.set(null);
}

function rebuild()
{
    const parent = parentPort.get();
    if (!parent)
    {
        outParent.set(null);
        return;
    }

    if (!parent.querySelector)
    {
        outParent.set(null);
        return;
    }

    op.setUiError("id", null);
    try
    {
        op.setUiError("multilinks", null);

        for (let i = 0; i < inPorts.length; i++)
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = parent.querySelector(selector);
            if (currentChild)
            {
                currentChild.remove();
            }
            const p = inPorts[i].get();
            if (inPorts[i].links.length > 1)
            {
                op.setUiError("multilinks", "Every port should only have not more then one connection");
            }
            if (p && parent)
            {
                if (!p.dataset)console.warn("[elementChilds] p no dataset ?!");
                else p.dataset.cablesChildId = op.id + "_" + i;
                parent.appendChild(p);
            }
        }
    }
    catch (e)
    {
        op.setUiError("id", e.message);
    }
    outParent.setRef(parent);
}
