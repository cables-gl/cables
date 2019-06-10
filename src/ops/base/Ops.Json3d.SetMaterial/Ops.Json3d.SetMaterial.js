const
    exe=op.inTrigger("exe"),
    materialName=op.inValueString("name"),
    material=op.inObject("material"),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;

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
