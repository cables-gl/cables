const
    render=op.inTrigger('render'),
    x=op.inFloat("x"),
    y=op.inFloat("y"),
    z=op.inFloat("z"),
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
