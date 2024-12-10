const
    exec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name", "default"),
    inSceneTime = op.inBool("Scene Time", true),
    inTime = op.inFloat("Time", 0),
    inSubmesh = op.inInt("Submesh", 0),
    inWeights = op.inArray("Target Weights"),
    outFound = op.outBool("Found Node"),
    outFoundSkin = op.outBool("Found Skin"),
    outTargetnames = op.outArray("Target Names"),
    outTex = op.outTexture("MorphTargets Tex"),
    next = op.outTrigger("Next");

exec.onTriggered = update;
const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
let arr = [];
let node = null;
const tr = vec3.create();

inSceneTime.onChange = updateTimeInputs;

updateTimeInputs();

function updateTimeInputs()
{
    inTime.setUiAttribs({ "greyout": inSceneTime.get() });
}

inNodeName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inNodeName.get() });
    node = null;
    update();
};

function update()
{
    if (!cgl.tempData || !cgl.tempData.currentScene) return;

    const gltf = cgl.tempData.currentScene;
    const name = inNodeName.get();
    let mesh = null;

    for (let i = 0; i < cgl.tempData.currentScene.nodes.length; i++)
    {
        if (cgl.tempData.currentScene.nodes[i].name == name)
        {
            node = cgl.tempData.currentScene.nodes[i];
        }
    }

    if (!node)
    {
        outFound.set(false);
        return;
    }

    if (node.mesh.meshes)
    {
        const idx = Math.abs(inSubmesh.get());
        if (node.mesh.meshes[idx]) mesh = node.mesh.meshes[idx];
    }
    if (!mesh)
    {
        outFound.set(false);
        return;
    }
    else outFound.set(true);

    if (mesh.extras && mesh.extras.targetNames) outTargetnames.set(mesh.extras.targetNames);
    if (mesh.morphTargetsRenderMod) outTex.setRef(mesh.morphTargetsRenderMod.tex);

    let time = gltf.time;
    if (!inSceneTime.get())
    {
        time = inTime.get();
        node.transform(cgl, time);
    }

    const w = inWeights.get();
    if (w)mesh.weights = w;
    mesh.render(cgl, true, false, true, false, true, time);

    next.trigger();
}
