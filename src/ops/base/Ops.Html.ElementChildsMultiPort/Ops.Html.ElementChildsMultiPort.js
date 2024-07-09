const
    parentPort = op.inObject("Parent", null, "element"),
    inObjs = op.inMultiPort("Childs", CABLES.OP_PORT_TYPE_OBJECT),
    outParent = op.outObject("Parent Out", null, "element"),
    outNum = op.outNumber("Num Values");

const oldEles = [];
let fakeParent = null;

inObjs.onChange =
parentPort.onChange = () =>
{
    rebuild();
    outNum.set(oldEles.length);
};

function removeOldEles()
{
    for (let i = 0; i < oldEles.length; i++)
        oldEles[i].remove();

    oldEles.length = 0;
}

function rebuild()
{
    const ports = inObjs.get();
    let parent = parentPort.get();

    if (!parent)
    {
        if (!fakeParent)
        {
            fakeParent = op.patch.getDocument().createElement("div");
            fakeParent.style.display = "none";
            fakeParent.setAttribute("id", "fakeParent");
        }
        parent = fakeParent;
    }

    removeOldEles();

    for (let i = 0; i < ports.length; i++)
    {
        const ele = ports[i].get();
        if (ele)
        {
            oldEles.push(ele);
            parent.appendChild(ele);
        }
    }

    outNum.set(oldEles.length);
    if (parent == fakeParent)outParent.setRef(null);
    else outParent.setRef(parent);
}
