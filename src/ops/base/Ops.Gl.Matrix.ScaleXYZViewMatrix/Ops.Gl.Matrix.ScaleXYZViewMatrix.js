const
    render=op.inTrigger('render'),
    scaleX=op.inValueFloat("x",1),
    scaleY=op.inValueFloat("y",1),
    scaleZ=op.inValueFloat("z",1),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

scaleX.onChange=scaleY.onChange=scaleZ.onChange=scaleChanged;
scaleChanged();

render.onTriggered=exec;

function exec()
{
    cgl.pushViewMatrix();
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);
    trigger.trigger();
    cgl.popViewMatrix();
}

function scaleChanged()
{
    vec3.set(vScale, scaleX.get(),scaleY.get(),scaleZ.get());
    mat4.identity(transMatrix);
    mat4.scale(transMatrix,transMatrix, vScale);
}
