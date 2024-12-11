const
    exec = op.inTrigger("Update"),
    inNodeName = op.inString("Name", "default"),
    inSubmesh = op.inInt("Submesh", 0),
    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let mesh = null;
let currentSceneLoaded = null;

inSubmesh.onChange =
inNodeName.onChange = function ()
{
    outGeom.set(null);
    mesh = null;
    outFound.set(false);
    op.setUiAttrib({ "extendTitle": inNodeName.get() + "." + inSubmesh.get() });
};

exec.onTriggered = () =>
{
    if (!cgl.tempData.currentScene) return;
    if (currentSceneLoaded != cgl.tempData.currentScene.loaded) mesh = null;

    if (!mesh)
    {
        if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes || !cgl.tempData.currentScene.loaded)
        {
            return;
        }
        outFound.set(false);
        outGeom.set(null);
        const name = inNodeName.get();

        currentSceneLoaded = cgl.tempData.currentScene.loaded;

        for (let i = 0; i < cgl.tempData.currentScene.meshes.length; i++)
        {
            if (cgl.tempData.currentScene.meshes[i].name == name)
            {
                mesh = cgl.tempData.currentScene.meshes[i];

                const idx = Math.abs(inSubmesh.get());
                if (mesh.meshes[idx] && mesh.meshes[idx].geom)
                {
                    outFound.set(true);
                    outGeom.set(mesh.meshes[idx].geom);
                }
            }
        }
    }

    next.trigger();
};
