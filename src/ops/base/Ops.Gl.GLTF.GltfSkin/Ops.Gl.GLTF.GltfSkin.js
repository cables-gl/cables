const
    exec = op.inTrigger("Render"),
    inNodeName = op.inString("Node Name", "default"),
    inSceneTime = op.inBool("Scene Time", true),
    inTime = op.inFloat("Time", 0),
    outFound = op.outBool("Found Node"),
    outFoundSkin = op.outBool("Found Skin"),
    next = op.outTrigger("Next");

exec.onTriggered = update;
const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name);
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
    if (!cgl.frameStore.currentScene) return;

    const gltf = cgl.frameStore.currentScene;
    const name = inNodeName.get();

    for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
    {
        if (cgl.frameStore.currentScene.nodes[i].name == name)
        {
            node = cgl.frameStore.currentScene.nodes[i];
            outFound.set(true);
            // console.log(node);
        }
    }

    if (!node)
    {
        outFound.set(false);
        return;
    }

    outFoundSkin.set(node.skin > -1);

    if (node.skin == -1)
    {
        return;
    }

    if (!gltf.json.skins)
    {
        op.warn.log("no skins found...");
        return;
    }

    let time = gltf.time;
    if (!inSceneTime.get())
    {
        time = inTime.get();
    }

    if (!inSceneTime.get())
        for (let i = 0; i < gltf.nodes.length; i++)
            if (!gltf.nodes[i].isChild)
            {
                gltf.nodes[i].render(cgl, false, true, true, false, false, time);
            }

    node.render(cgl, true, false, true, false, true, time);

    next.trigger();
}
