
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var x=op.addInPort(new CABLES.Port(op,"x"));
var y=op.addInPort(new CABLES.Port(op,"y"));
var z=op.addInPort(new CABLES.Port(op,"z"));

x.set(0.0);
y.set(0.0);
z.set(0.0);

var vec=vec3.create();

render.onTriggered=function()
{
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushViewMatrix();
    mat4.translate(cgl.vMatrix,cgl.vMatrix, vec);
    trigger.trigger();
    cgl.popViewMatrix();
};
