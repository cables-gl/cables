// http://stackoverflow.com/questions/5504635/computing-fovx-opengl

var render=op.inTrigger('render');
var fovY=op.addInPort(new CABLES.Port(op,"fov y",CABLES.OP_PORT_TYPE_VALUE ));
var zNear=op.addInPort(new CABLES.Port(op,"frustum near",CABLES.OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new CABLES.Port(op,"frustum far",CABLES.OP_PORT_TYPE_VALUE ));
var autoAspect=op.inValueBool("Auto Aspect Ratio",true);
var aspect=op.inValue("Aspect Ratio");

var trigger=op.outTrigger('trigger');


var cgl=op.patch.cgl;
zNear.set(0.01);
fovY.set(45);
zFar.set(500.0);

fovY.onChange=changed;
zFar.onChange=changed;
zNear.onChange=changed;
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

