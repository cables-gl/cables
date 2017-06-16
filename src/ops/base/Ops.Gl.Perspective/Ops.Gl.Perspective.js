// http://stackoverflow.com/questions/5504635/computing-fovx-opengl


op.name='Perspective';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var fovY=op.addInPort(new Port(op,"fov y",OP_PORT_TYPE_VALUE ));
var zNear=op.addInPort(new Port(op,"frustum near",OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new Port(op,"frustum far",OP_PORT_TYPE_VALUE ));
var autoAspect=op.inValueBool("Auto Aspect Ratio",true);
var aspect=op.inValue("Aspect Ratio");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


var cgl=op.patch.cgl;
zNear.set(1);
fovY.set(45);
zFar.set(500.0);

fovY.onValueChanged=changed;
zFar.onValueChanged=changed;
zNear.onValueChanged=changed;
changed();

var asp=0;

render.onTriggered=function()
{
    asp=cgl.getViewPort()[2]/cgl.getViewPort()[3];
    if(!autoAspect.get())asp=aspect.get();
    
    cgl.pushPMatrix();
    mat4.perspective(
        cgl.pMatrix,
        fovY.get()*0.0174533, 
        asp, 
        zNear.get(), 
        zFar.get());

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

