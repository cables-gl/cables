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
    outFound = op.outBoolNum("Found");
const cgl = op.patch.cgl;

let node = null;
let searched = false;
let currentScene = null;
let currentSceneLoaded = null;
const nodesByName = new Map();

inNodeName.onChange = function ()
{
    outGeom.set(null);
    node = null;
    searched = false;
    outFound.set(false);
    if (!inNodeName.isLinked()) op.setUiAttrib({ "extendTitle": inNodeName.get() });
};

inSceneTime.onChange = updateTimeInputs;

updateTimeInputs();

function updateTimeInputs()
{
    inTime.setUiAttribs({ "greyout": inSceneTime.get() });
}

function updateNodesByName(scene)
{
    currentScene = scene;
    currentSceneLoaded = scene.loaded;
    nodesByName.clear();
    for (let i = 0; i < scene.nodes.length; i++) nodesByName.set(scene.nodes[i].name, scene.nodes[i]);
}

inExec.onTriggered = function ()
{
    const scene = cgl.tempData.currentScene;
    if (!scene || !scene.nodes) return outFound.set(false);

    if (currentScene != scene || currentSceneLoaded != scene.loaded)
    {
        updateNodesByName(scene);
        node = null;
        searched = false;
    }

    if (!node && !searched)
    {
        searched = true;
        node = nodesByName.get(inNodeName.get()) || null;

        if (node && node.mesh && node.mesh.meshes)
        {
            if (node.mesh.meshes[0].geom) outGeom.setRef(node.mesh.meshes[0].geom);
            else outGeom.set(null);
        }

        if (!node) op.setUiError("nf", "Node not found", 1);
        else op.setUiError("nf", null);

        outFound.set(node != null);
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
