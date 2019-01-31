const
    render=op.inTrigger("render"),
    scaleX=op.inValueFloat("x",1),
    scaleY=op.inValueFloat("y",1),
    scaleZ=op.inValueFloat("z",1),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const vScale=vec3.create();

var hasChanged=true;

scaleX.onChange=scaleY.onChange=scaleZ.onChange=scaleChanged;

scaleChanged();

render.onTriggered=execrender;

function execrender()
{
    if(hasChanged)
    {
        vec3.set(vScale, scaleX.get(),scaleY.get(),scaleZ.get());
        hasChanged=false;
    }

    cgl.pushModelMatrix();
    mat4.scale(cgl.mMatrix,cgl.mMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
}

function scaleChanged()
{
    hasChanged=true;
}

