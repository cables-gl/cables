const
    exec = op.inTrigger("Update"),
    inNodeName = op.inString("Name", "default"),
    inSubmesh = op.inInt("Submesh", 0),
    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let node = null;
let currentSceneLoaded = null;

inSubmesh.onChange =
inNodeName.onChange = function ()
{
    outGeom.set(null);
    node = null;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() + "." + inSubmesh.get() });
};

exec.onTriggered = () =>
{
    if (!cgl.frameStore.currentScene) return;
    if (currentSceneLoaded != cgl.frameStore.currentScene.loaded) node = null;

    if (!node)
    {
        if (!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.nodes || !cgl.frameStore.currentScene.loaded)
        {
            return;
        }

        outFound.set(false);
        outGeom.set(null);
        const name = inNodeName.get();

        currentSceneLoaded = cgl.frameStore.currentScene.loaded;

        for (let i = 0; i < cgl.frameStore.currentScene.nodes.length; i++)
        {
            if (cgl.frameStore.currentScene.nodes[i].name == name)
            {
                node = cgl.frameStore.currentScene.nodes[i];

                const idx = Math.abs(inSubmesh.get());
                if (node.mesh.meshes[idx] && node.mesh.meshes[idx].geom)
                {
                    outFound.set(true);
                    outGeom.set(node.mesh.meshes[idx].geom);
                }
            }
        }
    }

    next.trigger();
};
