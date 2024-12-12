const
    exe = op.inTrigger("exe"),
    materialName = op.inValueString("name"),
    material = op.inObject("material"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;

function render()
{
    if (material.get())
    {
        if (!cglframeStorecurrentScene.materials) cglframeStorecurrentScene.materials = [];

        cglframeStorecurrentScene.materials[materialName.get()] = material.get();
    }

    trigger.trigger();
}

exe.onTriggered = render;
