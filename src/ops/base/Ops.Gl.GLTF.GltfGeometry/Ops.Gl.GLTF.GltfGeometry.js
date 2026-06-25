const
    exec = op.inTrigger("Update"),
    inNodeName = op.inString("Name", "default"),
    inNameMatch = op.inSwitch("Name Match", ["exact", "starts with", "contains"], "exact"),
    inSubmesh = op.inInt("Submesh", 0),
    next = op.outTrigger("Next"),
    outGeom = op.outObject("Geometry", null, "geometry"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let mesh = null;
let currentSceneLoaded = null;

inNameMatch.onChange =
    inSubmesh.onChange =
    inNodeName.onChange = function ()
    {
        outGeom.setRef(null);
        mesh = null;
        outFound.set(false);
        let title = inNodeName.get();
        if (inSubmesh.get()) title += "." + inSubmesh.get();
        op.setUiAttrib({ "extendTitle": title });
    };

exec.onTriggered = () =>
{
    if (!cgl.tempData.currentScene) return;
    if (currentSceneLoaded != cgl.tempData.currentScene.loaded) mesh = null;

    if (!mesh)
    {
        if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes || !cgl.tempData.currentScene.loaded)
            return;

        const name = inNodeName.get();
        let found = false;

        currentSceneLoaded = cgl.tempData.currentScene.loaded;

        for (let i = 0; i < cgl.tempData.currentScene.meshes.length; i++)
        {
            let matches = false;
            // console.log("text",cgl.tempData.currentScene.meshes);
            if (inNameMatch.get() == "exact")
                matches = cgl.tempData.currentScene.meshes[i].name == name;
            else if (inNameMatch.get() == "contains")
                matches = cgl.tempData.currentScene.meshes[i].name.includes(name);
            else
                matches = cgl.tempData.currentScene.meshes[i].name.startsWith(name);

            if (matches)
            {
                mesh = cgl.tempData.currentScene.meshes[i];

                const idx = Math.abs(inSubmesh.get());

                if (mesh && mesh.meshes && mesh.meshes[idx] && mesh.meshes[idx].geom)
                {
                    found = true;
                    outGeom.setRef(mesh.meshes[idx].geom);
                }
                else
                {
                    if (mesh && mesh.meshes && mesh.meshes[idx] && mesh.meshes[idx].mesh)
                    {
                        console.log("11", mesh.meshes[idx]);
                        found = true;
                        outGeom.setRef(mesh.meshes[idx].mesh.geom);

                    }
                    else
                    {
                        console.log("ja abernein");
                        found = false;
                    }
                }
                if (found) break;
            }
        }

        if (!found)
        {
            op.setUiError("notfound", "Geometry not found", 1);
            outGeom.setRef(null);
        }
        else op.setUiError("notfound", null);
        outFound.set(found);
    }

    next.trigger();
};
