const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger")
const x=op.inValue("x");
const y=op.inValue("y");
const z=op.inValue("z");

const cgl=op.patch.cgl;

var vec=vec3.create();

render.onTriggered=function()
{
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
    trigger.trigger();
    cgl.popModelMatrix();
};
