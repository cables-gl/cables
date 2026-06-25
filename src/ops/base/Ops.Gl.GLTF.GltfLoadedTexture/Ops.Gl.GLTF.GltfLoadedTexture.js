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
    if (gltf != oldScene) tex = null;
    if (tex) return;

    if (!gltf || !gltf.json || !gltf.chunks) return;

    op.setUiError("id", null);

    for (let index = 0; index < gltf.textures.length; index++)
    {
        let name = gltf.json.images[index].name;
        if (name == imgName.get())
        {
            if (gltf.textures[index] && gltf.textures[index])
            {
                outFound.set(true);
                outTex.setRef(gltf.textures[index].tex);
                return;
            }
            else console.log("no tex ?");
        }
    }
    outFound.set(false);
    op.setUiError("id", "texture not found!", 1);
    outTex.setRef(CGL.Texture.getEmptyTexture(cgl));

    // console.log("text",cgl.tempData.currentScene)
    // outTex.setRef(tex);
};
