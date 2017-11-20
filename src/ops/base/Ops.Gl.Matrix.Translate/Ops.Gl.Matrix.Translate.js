
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var x=op.addInPort(new Port(op,"x"));
var y=op.addInPort(new Port(op,"y"));
var z=op.addInPort(new Port(op,"z"));

x.set(0.0);
y.set(0.0);
z.set(0.0);

var vec=vec3.create();

render.onTriggered=function()
{
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    trigger.trigger();
    cgl.popMvMatrix();
};
