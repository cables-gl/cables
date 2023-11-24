const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    next = op.outTrigger("Next"),
    inApply = op.inBool("Set Matrix", true),
    outFound = op.outBool("Found"),
    outMat = op.outArray("Matrix");

const cgl = op.patch.cgl;
const translate = vec3.create();
let node = null;
let currentSceneLoaded = null;
const m = mat4.create();

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
    let found = false;

    if (!node)
    {
        const name = inNodeName.get();

        if (!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.nodes) return;

        currentSceneLoaded = cgl.frameStore.currentScene.loaded;

        for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
        {
            if (cgl.frameStore.currentScene.nodes[i].name == name)
            {
                node = cgl.frameStore.currentScene.nodes[i];
                found = true;
                break;
            }
        }
    }
    else
    {
        found = true;
    }

    outFound.set(found);
    cgl.pushModelMatrix();

    if (node)
    {
        mat4.copy(m, node.modelMatAbs());

        mat4.multiply(cgl.mMatrix, cgl.mMatrix, m);

        outMat.setRef(m);
    }

    next.trigger();
    cgl.popModelMatrix();
};
