this.name="SetMaterial";

var cgl=this.patch.cgl;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var materialName=this.addInPort(new Port(this,"name",OP_PORT_TYPE_VALUE,{'type':'string'}));
var material=this.addInPort(new Port(this,"material",OP_PORT_TYPE_OBJECT));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));


function render()
{
    if(material.get())
    {
        if(!cgl.frameStore.currentScene.materials) cgl.frameStore.currentScene.materials=[];
        
        cgl.frameStore.currentScene.materials[materialName.get()]=material.get();
    }
    
    trigger.trigger();

}

exe.onTriggered=render;

