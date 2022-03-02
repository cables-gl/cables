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

let q = quat.create();
let mat = mat4.create();
let qmat = mat4.create();

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
            }
        }
    }

    if (node)
    {
        mat4.identity(mat);
        mat4.translate(mat, mat, [inPosX.get(), inPosY.get(), inPosZ.get()]);

        mat4.rotateX(mat, mat, inRotX.get());
        mat4.rotateY(mat, mat, inRotY.get());
        mat4.rotateZ(mat, mat, inRotZ.get());

        node.addMulMat = mat;
    }

    next.trigger();
};
