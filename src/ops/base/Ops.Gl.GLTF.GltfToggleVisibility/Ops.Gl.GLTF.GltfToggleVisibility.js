const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    inVisible = op.inBool("Visible", true),

    next = op.outTrigger("Next"),
    outFound = op.outBool("Found");

const cgl = op.patch.cgl;

let node = null;
let currentSceneLoaded = null;
let needsUpdate = true;

inVisible.onChange = () =>
{
    needsUpdate = true;
};

inNodeName.onChange = function ()
{
    needsUpdate = true;
    node = null;
    outFound.set(false);
    if (!inNodeName.isLinked())op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

inExec.onTriggered = function ()
{
    const gltf = cgl.tempData.currentScene;
    if (!cgl.tempData.currentScene) return outFound.set(false);
    if (currentSceneLoaded != cgl.tempData.currentScene.loaded) node = null;

    if (!node || needsUpdate)
    {
        const name = inNodeName.get();

        if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes)
        {
            return outFound.set(false);
        }
        currentSceneLoaded = cgl.tempData.currentScene.loaded;
        let found = false;

        for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
        {
            if (cgl.tempData.currentScene.nodes[i].name == name)
            {
                found = true;
                node = cgl.tempData.currentScene.nodes[i];

                if (node)
                {
                    gltf.setNodeVisibility(node, inVisible.get());
                }
            }
        }
        needsUpdate = false;

        outFound.set(found);
    }

    next.trigger();

};
