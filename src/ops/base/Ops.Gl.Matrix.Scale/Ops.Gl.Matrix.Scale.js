const
    render=op.inTrigger("render"),
    scale=op.inValueFloat("scale",1.0),
    trigger=op.outTrigger("trigger");

const cgl=op.patch.cgl;
const vScale=vec3.create();

scale.onChange=scaleChanged;
scaleChanged();

render.onTriggered=function()
{
    cgl.pushModelMatrix();
    mat4.scale(cgl.mMatrix,cgl.mMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
};

function scaleChanged()
{
    var s=scale.get();
    vec3.set(vScale, s,s,s);
}

