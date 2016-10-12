op.name="SetMaterial";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var materialName=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{'type':'string'}));
var material=op.addInPort(new Port(op,"material",OP_PORT_TYPE_OBJECT));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

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

