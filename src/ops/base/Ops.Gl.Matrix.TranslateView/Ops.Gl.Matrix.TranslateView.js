const
    render=op.inTrigger('render'),
    x=op.inValueFloat("x"),
    y=op.inValueFloat("y"),
    z=op.inValueFloat("z"),
    trigger=op.outTrigger('trigger');

const cgl=op.patch.cgl;
const vec=vec3.create();

render.onTriggered=function()
{
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushViewMatrix();
    mat4.translate(cgl.vMatrix,cgl.vMatrix, vec);
    trigger.trigger();
    cgl.popViewMatrix();
};
