
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var matName=op.inValueString("name");

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;


exe.onTriggered=function()
{
    if(cgl.frameStore.currentScene.materials)
    {
        var mat=cgl.frameStore.currentScene.materials[matName.get()];

        if(mat)
        {
            cgl.setShader(mat);

            mat.bindTextures();
            trigger.trigger();
            cgl.setPreviousShader();
        }
    }
};
