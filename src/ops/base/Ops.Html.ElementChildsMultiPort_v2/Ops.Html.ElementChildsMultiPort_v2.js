const
    parentPort = op.inObject("Parent", null, "element"),
    inObjs = op.inMultiPort2("Childs", CABLES.OP_PORT_TYPE_OBJECT),
    outParent = op.outObject("Parent Out", null, "element"),
    outNum = op.outNumber("Num Values");

const oldEles = [];
let fakeParent = null;
let parent = null;
inObjs.onChange =
parentPort.onChange = () =>
{
    rebuild();
    outNum.set(oldEles.length);
};

function removeOldEles()
{
    for (let i = 0; i < oldEles.length; i++)
        if (oldEles[i])oldEles[i].remove();

    oldEles.length = 0;
}

function rebuild()
{
    const ports = inObjs.get();
    // console.log("oldeles", ports.length, oldEles.length);
    // if (parentPort.get() != parent)console.log("parentttttttttttt");
    // if (oldEles.length != ports.length)console.log(oldEles.length, ports.length);
    if (parent &&
    parentPort.get() == parent &&
    ports &&
    oldEles &&
    ports.length > 0 &&
    oldEles.length == ports.length)
    {
        let foundDiff = false;
        for (let i = 0; i < ports.length; i++)
        {
            if (ports[i].get() != oldEles[i] || (ports[i].get() && !parent.contains(ports[i].get())))
            {
                foundDiff = true;
                // console.log("found diff", ports[i].name, ports[i].get(), "u", oldEles[i]);
            }
        }
        if (!foundDiff) return;
    }
    parent = parentPort.get();

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
    // console.log("rebuild all");
    removeOldEles();

    for (let i = 0; i < ports.length; i++)
    {
        if (ports[i].links.length > 1)console.log("!!!!!!!!!! element childs to many", op.id);
        const ele = ports[i].get();
        oldEles.push(ele);
        if (ele)
        {
            parent.appendChild(ele);
        }
    }

    outNum.set(oldEles.length);
    if (parent == fakeParent)outParent.setRef(null);
    else outParent.setRef(parent);
}
