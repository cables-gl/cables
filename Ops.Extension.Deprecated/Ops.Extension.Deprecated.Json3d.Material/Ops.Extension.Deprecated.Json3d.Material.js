const exe = op.inTrigger("exe");
let matName = op.inValueString("name");

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

exe.onTriggered = function ()
{
    if (cglframeStorecurrentScene.materials)
    {
        let mat = cglframeStorecurrentScene.materials[matName.get()];

        if (mat)
        {
            cgl.pushShader(mat);

            mat.bindTextures();
            trigger.trigger();
            cgl.popShader();
        }
    }
};
