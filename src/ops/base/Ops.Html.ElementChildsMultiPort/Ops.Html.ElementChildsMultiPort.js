const
    parentPort = op.inObject("Parent", null, "element"),
    inObjs = op.inMultiPort("Childs", CABLES.OP_PORT_TYPE_OBJECT),
    outParent = op.outObject("Parent Out", null, "element"),
    outNum = op.outNumber("Num Values");

inObjs.onChange = () =>
{
    if (!parentPort.isLinked())
    {
        cleanUp();
    }
    else
    {
        rebuild();
    }

    console.log(inObjs.get());

    outNum.set(inObjs.length);
};

function cleanUp()
{
    for (let i = 0; i < inObjs.length; i++)
    {
        const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
        const currentChild = canvas.querySelector(selector);
        if (currentChild && currentChild.parentNode) currentChild.remove();
    }
    outParent.set(null);
}

const oldEles = [];

function rebuild()
{
    const parent = parentPort.get();

    for (let i = 0; i < oldEles.length; i++)
    {
        oldEles[i].remove();
    }
    oldEles.length = 0;

    for (let i = 0; i < inObjs.get().length; i++)
    {
        const ele = inObjs.get()[i];
        oldEles.push(ele);
        parent.appendChild(ele);
    }

    console.log("oldeles", oldEles.length);

    // if (!parent)
    // {
    //     outParent.set(null);
    //     return;
    // }

    // if (!parent.querySelector)
    // {
    //     outParent.set(null);
    //     return;
    // }

    // for (let i = 0; i < inObjs.length; i++)
    // {
    //     const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
    //     const currentChild = parent.querySelector(selector);
    //     if (currentChild)
    //     {
    //         currentChild.remove();
    //     }
    //     const p = inPorts[i].get();
    //     if (p && parent)
    //     {
    //         if (!p.dataset)console.warn("[elementChilds] p no dataset ?!");
    //         else p.dataset.cablesChildId = op.id + "_" + i;
    //         parent.appendChild(p);
    //     }

    // p.onLinkChanged = () =>
    // {
    //     if (!p.isLinked())
    //     {
    //         const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
    //         const currentChild = canvas.querySelector(selector);
    //         if (currentChild) currentChild.remove();
    //     }
    // };
    // }

    outParent.setRef(parent);
}
