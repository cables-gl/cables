op.name="FlowFieldForce";

op.name='PointLight';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"z",OP_PORT_TYPE_VALUE));


var forceObject={};


exe.onTriggered=function()
{
    // updateAll();

    vec3.transformMat4(mpos, [x.get(),y.get(),z.get()], cgl.mvMatrix);
    cgl.frameStore.phong.lights[id]=cgl.frameStore.phong.lights[id]||{};
    cgl.frameStore.phong.lights[id].pos=mpos;
    cgl.frameStore.phong.lights[id].mul=mul.get();
    cgl.frameStore.phong.lights[id].type=0;

    if(attachment.isLinked())
    {
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,
            [x.get(),
            y.get(),
            z.get()]);
        attachment.trigger();
        cgl.popMvMatrix();
    }

    trigger.trigger();

};
