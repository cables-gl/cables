const
    inExec = op.inTrigger("Render"),
    inIndex = op.inInt("Index", 0),
    inNodeName = op.inString("Node Name"),
    inTrans = op.inBool("Transformation", true),
    inIgnMaterial = op.inBool("Ignore Material", true),
    next = op.outTrigger("Next"),
    outFound = op.outNumber("Found"),
    outIndex = op.outNumber("Current Index");

const cgl = op.patch.cgl;

const nodes = [];
let currentSceneLoaded = null;
let oldScene = null;

inNodeName.onChange = function ()
{
    nodes.length = 0;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

inExec.onTriggered = function ()
{
    if (!cgl.tempData.currentScene) return;
    if (
        cgl.tempData.currentScene != oldScene ||
        currentSceneLoaded != cgl.tempData.currentScene.loaded) nodes.length = 0;

    if (!nodes.length)
    {
        const name = inNodeName.get();

        if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes)
        {
            return;
        }

        oldScene = cgl.tempData.currentScene;
        currentSceneLoaded = cgl.tempData.currentScene.loaded;

        for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
        {
            if (cgl.tempData.currentScene.nodes[i].name.indexOf(name) == 0)
            {
                nodes.push(cgl.tempData.currentScene.nodes[i]);
                cgl.tempData.currentScene.nodes[i].render(cgl, !inTrans.get(), false, inIgnMaterial.get(), true, true);
                outFound.set(true);
            }
        }
        outFound.set(nodes.length);
    }

    cgl.pushModelMatrix();

    const index = Math.floor(inIndex.get() % nodes.length);
    const node = nodes[index];

    if (node)
    {
        if (inTrans.get())
        {
            cgl.pushModelMatrix();
            node.transform(cgl);
        }

        outIndex.set(index);
        node.render(cgl, !inTrans.get(), false, inIgnMaterial.get(), true, true);
    }

    next.trigger();

    if (node)
    {
        if (inTrans.get()) cgl.popModelMatrix();
    }

    cgl.popModelMatrix();
};
