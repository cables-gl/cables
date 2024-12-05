const
    parentPort = op.inObject("Parent", null, "element"),
    childPort = op.inObject("Child", null, "element"),
    parentOutPort = op.outObject("Parent Out", null, "element"),
    childOutPort = op.outObject("Child Out", null, "element");

const CANVAS_ELEMENT = op.patch.cgl.canvas.parentElement;
let lastParent = null;
let lastChild = null;

op.toWorkPortsNeedToBeLinked(parentPort);

parentPort.onChange =
    childPort.onChange = update;

function update()
{
    let parent = parentPort.get();
    let child = childPort.get();
    op.setUiError("err", null);

    try
    {
        if (parent !== lastParent)
        {
            if (parent)
            {
                handleParentConnect(parent, child);
            }
            else
            {
                handleParentDisconnect(parent, child);
            }
            lastParent = parent;
        }
        if (child !== lastChild)
        {
            if (child)
            {
                handleChildConnect(parent, child);
            }
            else
            {
                handleChildDisconnect(parent, child);
            }
            lastChild = child;
        }
        parentOutPort.setRef(parent);
        childOutPort.setRef(child);
    }
    catch (e)
    {
        op.setUiError("err", e.message);
    }
}

function handleParentConnect(parent, child)
{
    if (child)
    {
        parent.appendChild(child);
    }
}

function handleParentDisconnect(parent, child)
{
    if (child)
    {
        CANVAS_ELEMENT.appendChild(child); // if there is no parent, append to patch
    }
}

function handleChildConnect(parent, child)
{
    if (parent)
    {
        parent.appendChild(child);
    }
}

function handleChildDisconnect(parent, child)
{
    if (lastChild)
    {
        CANVAS_ELEMENT.appendChild(lastChild);
    }
}
