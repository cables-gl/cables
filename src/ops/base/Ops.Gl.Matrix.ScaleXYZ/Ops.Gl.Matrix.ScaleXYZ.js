const render=op.inTrigger("render");
const scaleX=op.addInPort(new CABLES.Port(op,"x"));
const scaleY=op.addInPort(new CABLES.Port(op,"y"));
const scaleZ=op.addInPort(new CABLES.Port(op,"z"));

const trigger=op.outTrigger("trigger")

const cgl=op.patch.cgl;
const vScale=vec3.create();

var hasChanged=true;

render.onTriggered=function()
{
    cgl.pushModelMatrix();
    mat4.scale(cgl.mMatrix,cgl.mMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
};

var scaleChanged=function()
{
    hasChanged=true;
    vec3.set(vScale, scaleX.get(),scaleY.get(),scaleZ.get());
};

scaleX.set(1.0);
scaleY.set(1.0);
scaleZ.set(1.0);

scaleX.onValueChange(scaleChanged);
scaleY.onValueChange(scaleChanged);
scaleZ.onValueChange(scaleChanged);

scaleChanged();