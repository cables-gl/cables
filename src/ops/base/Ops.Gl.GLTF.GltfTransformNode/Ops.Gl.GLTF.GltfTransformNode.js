const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    inPosX = op.inFloat("Translate X", 0),
    inPosY = op.inFloat("Translate Y", 0),
    inPosZ = op.inFloat("Translate Z", 0),

    next = op.outTrigger("Next"),
    outFound = op.outBool("Found");
const cgl = op.patch.cgl;

const origTrans = vec3.create();

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

                console.log(node);
                vec3.set(origTrans, node._node.translation[0], node._node.translation[1], node._node.translation[2]);
            }
        }
    }

    // cgl.pushModelMatrix();

    if (node)
    {
        // cgl.pushModelMatrix();
        // node.transform(cgl);

        node._node.translation[0] = origTrans[0] + inPosX.get();
        node._node.translation[1] = origTrans[1] + inPosY.get();
        node._node.translation[2] = origTrans[2] + inPosZ.get();

        node.updateMatrix();
        // node.render(cgl, true, false, false, true, true);
    }


    next.trigger();

    // if (node)
    // {
    //     cgl.popModelMatrix();
    // }

    // cgl.popModelMatrix();
};
