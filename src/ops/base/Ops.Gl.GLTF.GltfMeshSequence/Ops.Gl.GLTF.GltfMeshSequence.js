const
    inExec = op.inTrigger("Render"),
    inIndex = op.inInt("Index", 0),
    inNodeName = op.inString("Node Name"),
    inTrans = op.inBool("Transformation", true),
    inIgnMaterial = op.inBool("Ignore Material", true),
    next = op.outTrigger("Next"),
    outFound = op.outNumber("Found");
const cgl = op.patch.cgl;

const nodes = [];
let currentSceneLoaded = null;

inNodeName.onChange = function ()
{
    nodes.length = 0;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;
    if (currentSceneLoaded != cgl.frameStore.currentScene.loaded) nodes.length = 0;

    if (!nodes.length)
    {
        const name = inNodeName.get();

        if (!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.nodes)
        {
            return;
        }
        currentSceneLoaded = cgl.frameStore.currentScene.loaded;

        for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
        {
            if (cgl.frameStore.currentScene.nodes[i].name.indexOf(name))
            {
                nodes.push(cgl.frameStore.currentScene.nodes[i]);
                cgl.frameStore.currentScene.nodes[i].render(cgl, !inTrans.get(), false, inIgnMaterial.get(), true, true);
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

        node.render(cgl, !inTrans.get(), false, inIgnMaterial.get(), true, true);
    }


    next.trigger();

    if (node)
    {
        if (inTrans.get()) cgl.popModelMatrix();
    }

    cgl.popModelMatrix();
};
