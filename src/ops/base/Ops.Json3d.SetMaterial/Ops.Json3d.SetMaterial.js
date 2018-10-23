
var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var materialName=op.inValueString("name");
var material=op.addInPort(new Port(op,"material",CABLES.OP_PORT_TYPE_OBJECT));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

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
