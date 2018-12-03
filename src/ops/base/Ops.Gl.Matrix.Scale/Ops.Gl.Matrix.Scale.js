const render=op.inTrigger("render");
const scale=op.addInPort(new CABLES.Port(op,"scale"));
const trigger=op.outTrigger("trigger")

const cgl=op.patch.cgl;
const vScale=vec3.create();
scale.onChange=scaleChanged;
scale.set(1.0);
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
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
}

