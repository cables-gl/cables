const
    inExec = op.inTrigger("Render"),
    imgName = op.inString("Name", ""),
    outTex = op.outTexture("Texture"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;
let tex = null;

let oldScene = null;
imgName.onChange = () => { reloadSoon(); };

function reloadSoon()
{
    tex = null;
}

inExec.onTriggered = function ()
{
    const gltf = cgl.tempData.currentScene;
    if (gltf != oldScene)tex = null;
    if (tex) return;

    if (!gltf || !gltf.json || !gltf.chunks) return;

    for (let index = 0; index < gltf.textures.length; index++)
    {
        let name = gltf.json.images[index].name;
        if (name == imgName.get())
        {
            outTex.setRef(gltf.textures[index].tex);
            return;
        }
    }
    outTex.setRef(CGL.Texture.getEmptyTexture(cgl));

// console.log("text",cgl.tempData.currentScene)
    // outTex.setRef(tex);
};
