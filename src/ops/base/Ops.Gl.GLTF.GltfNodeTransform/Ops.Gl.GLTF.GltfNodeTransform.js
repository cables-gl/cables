const
    inExec = op.inTrigger("Update"),
    inNodeName = op.inString("Node Name"),
    outPosX = op.outNumber("Translate X", 0),
    outPosY = op.outNumber("Translate Y", 0),
    outPosZ = op.outNumber("Translate Z", 0),
    next = op.outTrigger("Next"),
    outFound = op.outBool("Found");

const cgl = op.patch.cgl;
const translate = vec3.create();
let node = null;
let currentSceneLoaded = null;

inNodeName.onChange = function ()
{
    node = null;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
};


inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;
    if (currentSceneLoaded != cgl.frameStore.currentScene.loaded) node = null;

    if (!node)
    {
        const name = inNodeName.get();

        if (!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.nodes)
        {
            return;
        }
        currentSceneLoaded = cgl.frameStore.currentScene.loaded;

        for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
        {
            if (cgl.frameStore.currentScene.nodes[i].name == name)
            {
                node = cgl.frameStore.currentScene.nodes[i];
                outFound.set(true);
            }
        }
    }

    if (node)
    {
        mat4.getTranslation(translate, node.modelMatAbs());
        outPosX.set(translate[0]);
        outPosY.set(translate[1]);
        outPosZ.set(translate[2]);
    }

    next.trigger();
};
