const exe = op.inTrigger("exe");
const key = op.inValueString("Key");
const next = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let mat = null;

exe.onTriggered = function ()
{
    if (!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.replaceMaterials)
    {
        next.trigger();
        return;
    }

    let replMats = cgl.frameStore.currentScene.replaceMaterials;
    if (replMats)
    {
        if (!mat)
        {
            mat = replMats[key.get()];
        }

        if (mat)
        {
            cgl.pushShader(mat);
            if (mat.bindTextures) mat.bindTextures();
            next.trigger();
            cgl.popShader();
        }
    }
};
