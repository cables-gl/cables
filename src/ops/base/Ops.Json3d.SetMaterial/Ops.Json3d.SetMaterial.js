
const exe=op.inTrigger("exe");
var materialName=op.inValueString("name");
var material=op.addInPort(new CABLES.Port(op,"material",CABLES.OP_PORT_TYPE_OBJECT));
var trigger=op.outTrigger('trigger');

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
