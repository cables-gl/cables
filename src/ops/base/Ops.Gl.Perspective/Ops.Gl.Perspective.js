// http://stackoverflow.com/questions/5504635/computing-fovx-opengl


op.name='Perspective';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var fovY=op.addInPort(new Port(op,"fov y",OP_PORT_TYPE_VALUE ));
var zNear=op.addInPort(new Port(op,"frustum near",OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new Port(op,"frustum far",OP_PORT_TYPE_VALUE ));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
zNear.set(0.1);
fovY.set(45);
zFar.set(2000.0);

fovY.onValueChanged=changed;
zFar.onValueChanged=changed;
zNear.onValueChanged=changed;
changed();

render.onTriggered=function()
{
    mat4.perspective(cgl.pMatrix,cgl.frameStore.perspective.fovy*0.0174533, cgl.getViewPort()[2]/cgl.getViewPort()[3], cgl.frameStore.perspective.zNear, cgl.frameStore.perspective.zFar);
    cgl.pushPMatrix();

    trigger.trigger();

    cgl.popPMatrix();
};

function changed()
{
    cgl.frameStore.perspective=
    {
        fovy:fovY.get(),
        zFar:zFar.get(),
        zNear:zNear.get(),
    };
}

