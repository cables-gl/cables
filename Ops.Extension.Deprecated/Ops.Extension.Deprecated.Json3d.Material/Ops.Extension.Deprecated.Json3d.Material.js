const exe = op.inTrigger("exe");
let matName = op.inValueString("name");

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

exe.onTriggered = function ()
{
    if (cgl.frameStore.currentScene.materials)
    {
        let mat = cgl.frameStore.currentScene.materials[matName.get()];

        if (mat)
        {
            cgl.pushShader(mat);

            mat.bindTextures();
            trigger.trigger();
            cgl.popShader();
        }
    }
};
