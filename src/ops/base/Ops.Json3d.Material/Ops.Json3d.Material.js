
const exe=op.inTrigger("exe");
var matName=op.inValueString("name");

var trigger=op.outTrigger('trigger');

var cgl=op.patch.cgl;


exe.onTriggered=function()
{
    if(cgl.frameStore.currentScene.materials)
    {
        var mat=cgl.frameStore.currentScene.materials[matName.get()];

        if(mat)
        {
            cgl.pushShader(mat);

            mat.bindTextures();
            trigger.trigger();
            cgl.popShader();
        }
    }
};
