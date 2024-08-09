const
    inExec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name"),
    inTrans = op.inBool("Transformation", true),
    inDraw = op.inBool("Draw Mesh", true),
    inChilds = op.inBool("Draw Childs", true),
    inIgnMaterial = op.inBool("Ignore Material", true),

    inSceneTime = op.inBool("Use Scene Time", true),
    inTime = op.inFloat("Time", 0),

    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outFound = op.outBool("Found");
const cgl = op.patch.cgl;

let node = null;
let currentSceneLoaded = null;

inNodeName.onChange = function ()
{
    outGeom.set(null);
    node = null;
    outFound.set(false);
    if (!inNodeName.isLinked())op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

inSceneTime.onChange = updateTimeInputs;

updateTimeInputs();

function updateTimeInputs()
{
    inTime.setUiAttribs({ "greyout": inSceneTime.get() });
}

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

                if (node && node.mesh && node.mesh.meshes && node.mesh.meshes[0].geom)
                {
                    outGeom.setRef(node.mesh.meshes[0].geom);
                }
                else
                {
                    console.log("has no geom?!");
                    outGeom.set(null);
                }
            }
        }
    }

    cgl.pushModelMatrix();

    if (node)
    {
        if (inTrans.get())
        {
            cgl.pushModelMatrix();
            node.transform(cgl);
        }

        // node.updateMatrix();
        // render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time)

        let time;
        if (!inSceneTime.get()) time = inTime.get();

        node.render(cgl, !inTrans.get(), !inDraw.get(), inIgnMaterial.get(), !inChilds.get(), true, time);
    }

    next.trigger();

    if (node)
    {
        if (inTrans.get()) cgl.popModelMatrix();
    }

    cgl.popModelMatrix();
};
