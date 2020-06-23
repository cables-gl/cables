const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    inPosX = op.inFloat("Translate X", 0),
    inPosY = op.inFloat("Translate Y", 0),
    inPosZ = op.inFloat("Translate Z", 0),
    inRotX = op.inFloat("Rotation X", 0),
    inRotY = op.inFloat("Rotation Y", 0),
    inRotZ = op.inFloat("Rotation Z", 0),
    next = op.outTrigger("Next"),
    outFound = op.outBool("Found");

const cgl = op.patch.cgl;
const origTrans = vec3.create();
const origRot = quat.create();

let node = null;
let currentSceneLoaded = null;

inNodeName.onChange = function ()
{
    node = null;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

op.onDelete = function ()
{
    // todo restore orig values!
};

inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;
    if (currentSceneLoaded != cgl.frameStore.currentScene.loaded) node = null;

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
                outFound.set(true);
                vec3.set(origTrans, node._node.translation[0], node._node.translation[1], node._node.translation[2]);

                quat.set(origRot, node._node.rotation[0], node._node.rotation[1], node._node.rotation[2], node._node.rotation[3]);
            }
        }
    }

    if (node)
    {
        node._node.translation[0] = origTrans[0] + inPosX.get();
        node._node.translation[1] = origTrans[1] + inPosY.get();
        node._node.translation[2] = origTrans[2] + inPosZ.get();

        if (!node._node.rotation)node._node.rotation = quat.create();
        quat.fromEuler(node._node.rotation,
            inRotX.get(),
            inRotY.get(),
            inRotZ.get());

        node.updateMatrix();
    }


    next.trigger();
};
