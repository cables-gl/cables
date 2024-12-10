const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    inNum = op.inInt("Steps", 100),
    inFullAnim = op.inBool("Full Animation", true),
    inAnimStart = op.inFloat("Start", 0),
    inAnimLen = op.inFloat("Length", 10),
    next = op.outTrigger("Next"),
    outFound = op.outBool("Found"),
    outArr = op.outArray("Positions");

const cgl = op.patch.cgl;

op.setPortGroup("Timing", [inFullAnim, inAnimStart, inAnimLen]);
let node = null;

inFullAnim.onChange = function ()
{
    inAnimStart.setUiAttribs({ "greyout": inFullAnim.get() });
    inAnimLen.setUiAttribs({ "greyout": inFullAnim.get() });
};

inNodeName.onChange = function ()
{
    outArr.set(null);
    node = null;
    outFound.set(false);
};

inExec.onTriggered = function ()
{
    if (!cgl.tempData.currentScene) return;

    if (!node)
    {
        const name = inNodeName.get();

        if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes)
        {
            return;
        }

        for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
        {
            if (cgl.tempData.currentScene.nodes[i].name == name)
            {
                node = cgl.tempData.currentScene.nodes[i];
                outFound.set(true);
            }
        }
    }

    // var idx=inNode.get();
    // idx=Math.max(0,idx);
    // idx=Math.min(cgl.tempData.currentScene.nodes.length-1,idx);

    const n = node;
    const arr = [];

    if (n && n._animTrans && n._animTrans.length)
    {
        const num = inNum.get();
        let len = n._animTrans[0].getLength();
        let add = 0;

        if (!inFullAnim.get())
        {
            len = inAnimLen.get();
            add = inAnimStart.get();
        }

        for (let i = 0; i < num; i++)
        {
            const t = len * i / num + add;

            arr[i * 3 + 0] = n._animTrans[0].getValue(t);
            arr[i * 3 + 1] = n._animTrans[1].getValue(t);
            arr[i * 3 + 2] = n._animTrans[2].getValue(t);
        }

        outArr.setRef(arr);
    }
    else outArr.set(null);

    next.trigger();
};
