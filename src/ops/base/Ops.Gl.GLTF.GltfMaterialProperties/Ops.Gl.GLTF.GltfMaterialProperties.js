const
    exec = op.inTrigger("Update"),
    inMatName = op.inString("Material Name", "default"),
    inNameMatch = op.inSwitch("Name Match", ["exact", "starts with"], "exact"),
    next = op.outTrigger("Next"),
    outObj = op.outObject("Properties"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let currentSceneLoaded = null;
let mat = null;
let matIdx = -1;

// inSubmesh.onChange =
inNameMatch.onChange =
inMatName.onChange = function ()
{
    outObj.setRef(null);
    outFound.set(false);
    let title = inMatName.get();
    matIdx = -1;
    mat = null;
};

exec.onTriggered = () =>
{
    if (!cgl.tempData.currentScene) return;
    // if (currentSceneLoaded != cgl.tempData.currentScene.loaded) mesh = null;

    if (!mat)
    {
    //     if (!cgl.tempData || !cgl.tempData.currentScene || !cgl.tempData.currentScene.nodes || !cgl.tempData.currentScene.loaded)
    //         return;

        outFound.set(false);
        //     outGeom.setRef(null);
        //     const name = inMatName.get();
        //     let numMatches = 0;

        //     currentSceneLoaded = cgl.tempData.currentScene.loaded;
        // console.log("text", cgl.tempData.currentScene.json.materials);
        const mats = cgl.tempData.currentScene.materials;

        const name = inMatName.get();

        for (let i = 0; i < mats.length; i++)
        {
            let matches = false;

            if (inNameMatch.get() == "exact")
                matches = mats[i].name == name;
            else
                matches = mats[i].name.startsWith(name);

            if (matches)
            {
                mat = mats[i];
                matIdx = i;
                // console.log("mat", mats[i]);
                outObj.setRef(mat);
                outFound.set(true);
                break;
            }
        }
        //     {
        //         let matches = false;

        //         if (inNameMatch.get() == "exact")
        //             matches = cgl.tempData.currentScene.meshes[i].name == name34;
        //         else
        //             matches = cgl.tempData.currentScene.meshes[i].name.startsWith(name);

        //         if (matches)
        //         {
        //             numMatches++;
        //             mesh = cgl.tempData.currentScene.meshes[i];

        //             const idx = Math.abs(inSubmesh.get());
        //             if (mesh.meshes[idx] && mesh.meshes[idx].geom)
        //             {
        //                 outFound.set(true);
        //                 outGeom.setRef(mesh.meshes[idx].geom);
        //             }
        //         }
        //     }

        if (!outFound.get())op.setUiError("notfound", "material not found", 1);
        else op.setUiError("notfound", null);
    }

    if (mat)
    {
        mat.bind(op.patch.cgl, cgl.getShader());
        // console.log("laaaaaaa");
    }

    next.trigger();

    if (mat)
    {
        mat.unbind(op.patch.cgl, cgl.getShader());
        // console.log("laaaaaaa");
    }
};
