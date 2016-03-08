this.name="Ops.Json3d.Material";


var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var matName=this.addInPort(new Port(this,"name",OP_PORT_TYPE_VALUE,{'type':'string'}));

var cgl=this.patch.cgl;

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
            
            // console.log('mat found!');
        }
        else
        {
            // console.log('mat not found');
        }
    }


};


// cgl.frameStore.currentScene.materials[]