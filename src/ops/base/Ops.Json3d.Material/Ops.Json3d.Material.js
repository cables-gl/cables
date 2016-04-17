op.name="Ops.Json3d.Material";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var matName=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{'type':'string'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

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
