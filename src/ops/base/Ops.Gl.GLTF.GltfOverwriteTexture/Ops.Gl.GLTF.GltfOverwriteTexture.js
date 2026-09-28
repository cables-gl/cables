const
    exec = op.inTrigger("Trigger"),
    imgName = op.inString("Name", "default"),
    inTex = op.inTexture("Texture"),
    next = op.outTrigger("Next"),
    outFound = op.outBoolNum("Found");

const cgl = op.patch.cgl;

let origTex = null;
let origImg = null;
let oldScene = null;

op.onDelete = () =>
{
    if (origImg) origImg.tex = origTex;
};

exec.onTriggered = function ()
{
    const gltf = cgl.tempData.currentScene;
    // if (gltf != oldScene) tex = null;
    // if (tex) return;

    if (!gltf || !gltf.json || !gltf.chunks) return;

    op.setUiError("id", null);

    outFound.set(false);
    for (let index = 0; index < gltf.textures.length; index++)
    {
        let name = gltf.json.images[index].name;

        if (name == imgName.get())
        {
            // if (gltf.textures[index]
            // {
            let tex = origTex || CGL.Texture.getEmptyTexture(cgl);
            if (inTex.get()) tex = inTex.get().tex;

            if (!origTex)
            {
                origTex = gltf.textures[index].tex;
                origImg = gltf.textures[index];

            }

            gltf.textures[index].tex = tex;

            outFound.set(true);
            // outTex.setRef(gltf.textures[index].tex);
            return;
            // }
            // else console.log("no tex ?");
        }
    }
    outFound.set(true);
    op.setUiError("id", "texture not found!", 1);
    // outTex.setRef(CGL.Texture.getEmptyTexture(cgl));

    // console.log("text",cgl.tempData.currentScene)
    // outTex.setRef(tex);
};
